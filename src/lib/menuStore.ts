import { PRODUCTS } from '../data';
import { Product } from '../types';
import { supabase } from './supabase';
import { getApiUrl } from './apiConfig';

let menuRealtimeChannel: any = null;

// Subscribe to Supabase Realtime changes on 'menu_items'
export function setupSupabaseMenuRealtime(onMenuChange: () => void) {
  if (menuRealtimeChannel) return;
  menuRealtimeChannel = supabase
    .channel('menu_items_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'menu_items' },
      () => {
        onMenuChange();
      }
    )
    .subscribe();
}

export function getStoredProducts(): Product[] {
  try {
    const saved = localStorage.getItem('shivay_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem('shivay_products', JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('shivay_products_updated'));
  } catch (e) {
    console.error('Error saving shivay_products', e);
  }
}

// Fetch menu directly from Supabase 'menu_items' table
export async function fetchMenuFromServer(): Promise<Product[]> {
  try {
    const { data: items, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(items) && items.length > 0) {
      const formatted: Product[] = items.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        category: i.category,
        description: i.description || '',
        image: i.image_url || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
        badge: i.badge || '',
        available: i.available !== false,
      }));
      saveProducts(formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('Direct Supabase menu fetch issue, trying backend API:', err);
  }

  // Fallback to Express backend API
  try {
    const res = await fetch(getApiUrl('/api/menu'));
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        saveProducts(items);
        return items;
      }
    }
  } catch (err) {
    console.warn('Could not fetch menu from server API:', err);
  }

  return getStoredProducts();
}

// Add new menu item directly to Supabase
export async function addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    const { data: item, error } = await supabase
      .from('menu_items')
      .insert([
        {
          name: product.name.trim(),
          price: Number(product.price),
          category: product.category,
          description: product.description || '',
          image_url: product.image || '',
          badge: product.badge || '',
          available: product.available !== false,
        },
      ])
      .select()
      .single();

    if (!error && item) {
      const newProd: Product = {
        id: item.id,
        name: item.name,
        price: Number(item.price),
        category: item.category,
        description: item.description || '',
        image: item.image_url || '',
        badge: item.badge || '',
        available: item.available !== false,
      };
      const products = getStoredProducts();
      const updated = [newProd, ...products.filter((p) => p.id !== newProd.id)];
      saveProducts(updated);
      return newProd;
    }
  } catch (err) {
    console.warn('Supabase menu item insert error, trying API fallback:', err);
  }

  // API Fallback
  try {
    const res = await fetch(getApiUrl('/api/menu'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.item) {
        const products = getStoredProducts();
        const updated = [data.item, ...products.filter((p) => p.id !== data.item.id)];
        saveProducts(updated);
        return data.item;
      }
    }
  } catch (err) {
    console.error('Failed to post menu item to server API:', err);
  }

  return null;
}

// Update menu item in Supabase
export async function updateProduct(id: string, updatedFields: Partial<Product>): Promise<boolean> {
  try {
    const dbPayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updatedFields.name !== undefined) dbPayload.name = updatedFields.name.trim();
    if (updatedFields.price !== undefined) dbPayload.price = Number(updatedFields.price);
    if (updatedFields.category !== undefined) dbPayload.category = updatedFields.category;
    if (updatedFields.description !== undefined) dbPayload.description = updatedFields.description;
    if (updatedFields.image !== undefined) dbPayload.image_url = updatedFields.image;
    if (updatedFields.badge !== undefined) dbPayload.badge = updatedFields.badge;
    if (updatedFields.available !== undefined) dbPayload.available = updatedFields.available;

    const { error } = await supabase
      .from('menu_items')
      .update(dbPayload)
      .eq('id', id);

    if (!error) {
      const products = getStoredProducts();
      const updated = products.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      saveProducts(updated);
      return true;
    }
  } catch (err) {
    console.warn('Supabase menu update failed, trying API:', err);
  }

  try {
    const res = await fetch(getApiUrl(`/api/menu/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    });
    if (res.ok) {
      const products = getStoredProducts();
      const updated = products.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      saveProducts(updated);
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

// Delete menu item from Supabase
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      const products = getStoredProducts();
      const updated = products.filter((p) => p.id !== id);
      saveProducts(updated);
      return true;
    }
  } catch (err) {
    console.warn('Supabase delete failed, trying API:', err);
  }

  try {
    const res = await fetch(getApiUrl(`/api/menu/${id}`), {
      method: 'DELETE',
    });
    if (res.ok) {
      const products = getStoredProducts();
      const updated = products.filter((p) => p.id !== id);
      saveProducts(updated);
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}
