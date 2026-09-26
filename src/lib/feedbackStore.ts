import { supabase, getAuthUser } from './supabase';
import { getApiUrl } from './apiConfig';

export interface FeedbackItem {
  id: string;
  customerId?: string | null;
  orderId?: string | null;
  rating: number;
  message: string;
  createdAt: string;
  customerName?: string;
}

let feedbackRealtimeChannel: any = null;

export function setupSupabaseFeedbackRealtime(onChange: () => void) {
  if (feedbackRealtimeChannel) return;
  feedbackRealtimeChannel = supabase
    .channel('feedback_realtime_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'feedback' },
      () => {
        onChange();
      }
    )
    .subscribe();
}

export function getStoredFeedback(): FeedbackItem[] {
  try {
    const saved = localStorage.getItem('shivay_feedback');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveFeedback(items: FeedbackItem[]): void {
  try {
    localStorage.setItem('shivay_feedback', JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('shivay_feedback_updated'));
  } catch (e) {
    console.error('Error saving feedback', e);
  }
}

// Fetch feedback items from Supabase 'feedback' table
export async function fetchFeedbackFromServer(): Promise<FeedbackItem[]> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const formatted: FeedbackItem[] = data.map((f) => ({
        id: f.id,
        customerId: f.customer_id,
        orderId: f.order_id,
        rating: Number(f.rating) || 5,
        message: f.message || '',
        createdAt: f.created_at
          ? new Date(f.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
          : new Date().toLocaleDateString(),
      }));

      saveFeedback(formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('Direct Supabase feedback fetch notice:', err);
  }

  // Fallback to Express backend API
  try {
    const res = await fetch(getApiUrl('/api/feedback'));
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveFeedback(data);
        return data;
      }
    }
  } catch (e) {
    console.warn('API feedback fallback failed:', e);
  }

  return getStoredFeedback();
}

export interface SubmitFeedbackInput {
  rating: number;
  message: string;
  orderId?: string;
  customerName?: string;
}

// Submit feedback directly into Supabase 'feedback' table
export async function submitFeedbackOnServer(input: SubmitFeedbackInput): Promise<FeedbackItem> {
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));
  const message = input.message?.trim() || '';

  if (!message) {
    throw new Error('Please enter your review or feedback comment');
  }

  const authUser = await getAuthUser();
  const customerId = authUser ? authUser.id : null;

  // Verify orderId is valid UUID if provided, else null
  let dbOrderId = null;
  if (input.orderId && input.orderId.length === 36 && input.orderId.includes('-')) {
    dbOrderId = input.orderId;
  }

  const formattedMsg = input.customerName ? `${input.customerName}: ${message}` : message;

  const { data, error } = await supabase
    .from('feedback')
    .insert([
      {
        customer_id: customerId,
        order_id: dbOrderId,
        rating,
        message: formattedMsg,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    console.warn('Direct Supabase feedback insert notice, trying API:', error);
    try {
      const res = await fetch(getApiUrl('/api/feedback'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: message,
          customerName: input.customerName,
        }),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.feedback) {
          const fbItem: FeedbackItem = {
            id: body.feedback.id,
            rating: body.feedback.rating,
            message: body.feedback.comment,
            createdAt: new Date().toLocaleDateString(),
            customerName: input.customerName,
          };
          const current = getStoredFeedback();
          saveFeedback([fbItem, ...current]);
          return fbItem;
        }
      }
    } catch (apiErr) {
      console.error('API feedback error:', apiErr);
    }
    throw new Error(error ? error.message : 'Failed to submit feedback to database');
  }

  const newFeedback: FeedbackItem = {
    id: data.id,
    customerId: data.customer_id,
    orderId: data.order_id,
    rating: data.rating,
    message: data.message,
    createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    customerName: input.customerName,
  };

  const current = getStoredFeedback();
  saveFeedback([newFeedback, ...current.filter((f) => f.id !== newFeedback.id)]);
  return newFeedback;
}
