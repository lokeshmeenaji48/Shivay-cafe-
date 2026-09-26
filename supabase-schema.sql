-- =========================================================
-- SHIVAY CAFÉ & RESTAURANT - AUDITED SUPABASE SECURITY SCHEMAS
-- Project ID: tmthwoalxnvibqshdots
-- =========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'profiles' Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('customer', 'owner')) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create 'menu_items' Table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    badge TEXT DEFAULT '',
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create 'orders' Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    table_number TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'Cash',
    payment_status TEXT DEFAULT 'Pending',
    order_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create 'order_items' Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL
);

-- 6. Create 'reservations' Table
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    table_number TEXT DEFAULT 'Standard',
    reservation_date TIMESTAMPTZ NOT NULL,
    guests INTEGER NOT NULL DEFAULT 2,
    special_requests TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create 'feedback' Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create Foreign Key Indexes to eliminate "Unindexed Foreign Key" warnings
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items(menu_item_id);

CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON public.reservations(customer_id);

CREATE INDEX IF NOT EXISTS idx_feedback_customer_id ON public.feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_order_id ON public.feedback(order_id);

-- 9. Create Security Helper Function (SECURITY DEFINER to prevent recursive policy lookup)
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 11. Cleanup Old & Permissive RLS Policies
DROP POLICY IF EXISTS "Public Profiles Select" ON public.profiles;
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Insert" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Read Policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Select Policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Update Policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Delete Policy" ON public.profiles;
DROP POLICY IF EXISTS "Users Read Own Profile or Owner Reads All" ON public.profiles;
DROP POLICY IF EXISTS "Users Insert Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users Update Own Profile or Owner Updates" ON public.profiles;

DROP POLICY IF EXISTS "Public Menu Read" ON public.menu_items;
DROP POLICY IF EXISTS "Menu Write Policy" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone Can Read Available Menu" ON public.menu_items;
DROP POLICY IF EXISTS "Owner Insert Menu Items" ON public.menu_items;
DROP POLICY IF EXISTS "Owner Update Menu Items" ON public.menu_items;
DROP POLICY IF EXISTS "Owner Delete Menu Items" ON public.menu_items;

DROP POLICY IF EXISTS "Orders Select Policy" ON public.orders;
DROP POLICY IF EXISTS "Orders Insert Policy" ON public.orders;
DROP POLICY IF EXISTS "Orders Update Policy" ON public.orders;
DROP POLICY IF EXISTS "Orders Delete Policy" ON public.orders;

DROP POLICY IF EXISTS "Order Items Select Policy" ON public.order_items;
DROP POLICY IF EXISTS "Order Items Insert Policy" ON public.order_items;
DROP POLICY IF EXISTS "Order Items Update Policy" ON public.order_items;
DROP POLICY IF EXISTS "Order Items Delete Policy" ON public.order_items;

DROP POLICY IF EXISTS "Reservations Select Policy" ON public.reservations;
DROP POLICY IF EXISTS "Reservations Insert Policy" ON public.reservations;
DROP POLICY IF EXISTS "Reservations Update Policy" ON public.reservations;
DROP POLICY IF EXISTS "Reservations Delete Policy" ON public.reservations;

DROP POLICY IF EXISTS "Feedback Select Policy" ON public.feedback;
DROP POLICY IF EXISTS "Feedback Insert Policy" ON public.feedback;
DROP POLICY IF EXISTS "Feedback Update Policy" ON public.feedback;
DROP POLICY IF EXISTS "Feedback Delete Policy" ON public.feedback;

-- 12. Create Audited Role-Based Policies

-- PROFILES
CREATE POLICY "Profiles Read Policy" ON public.profiles 
FOR SELECT USING (auth.uid() = id OR public.is_owner());

CREATE POLICY "Profiles Insert Policy" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id OR public.is_owner());

CREATE POLICY "Profiles Update Policy" ON public.profiles 
FOR UPDATE USING (auth.uid() = id OR public.is_owner()) 
WITH CHECK (auth.uid() = id OR public.is_owner());

-- MENU ITEMS (Public read available, Owner full control)
CREATE POLICY "Anyone Can Read Available Menu" ON public.menu_items 
FOR SELECT USING (available = true OR public.is_owner());

CREATE POLICY "Owner Insert Menu Items" ON public.menu_items 
FOR INSERT WITH CHECK (public.is_owner());

CREATE POLICY "Owner Update Menu Items" ON public.menu_items 
FOR UPDATE USING (public.is_owner()) WITH CHECK (public.is_owner());

CREATE POLICY "Owner Delete Menu Items" ON public.menu_items 
FOR DELETE USING (public.is_owner());

-- ORDERS (Customer create & read own/guest, Owner manage all & status)
CREATE POLICY "Orders Select Policy" ON public.orders 
FOR SELECT USING (
  customer_id = auth.uid() 
  OR customer_id IS NULL 
  OR public.is_owner()
);

CREATE POLICY "Orders Insert Policy" ON public.orders 
FOR INSERT WITH CHECK (
  (customer_id IS NULL OR customer_id = auth.uid() OR public.is_owner())
  AND order_status = 'pending'
);

CREATE POLICY "Orders Update Policy" ON public.orders 
FOR UPDATE USING (public.is_owner()) WITH CHECK (public.is_owner());

CREATE POLICY "Orders Delete Policy" ON public.orders 
FOR DELETE USING (public.is_owner());

-- ORDER ITEMS (Inherits order access)
CREATE POLICY "Order Items Select Policy" ON public.order_items 
FOR SELECT USING (
  public.is_owner() 
  OR EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL)
  )
);

CREATE POLICY "Order Items Insert Policy" ON public.order_items 
FOR INSERT WITH CHECK (
  public.is_owner() 
  OR EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL)
  )
);

CREATE POLICY "Order Items Update Policy" ON public.order_items 
FOR UPDATE USING (public.is_owner()) WITH CHECK (public.is_owner());

CREATE POLICY "Order Items Delete Policy" ON public.order_items 
FOR DELETE USING (public.is_owner());

-- RESERVATIONS
CREATE POLICY "Reservations Select Policy" ON public.reservations 
FOR SELECT USING (
  public.is_owner() 
  OR customer_id = auth.uid() 
  OR customer_id IS NULL
);

CREATE POLICY "Reservations Insert Policy" ON public.reservations 
FOR INSERT WITH CHECK (
  customer_id IS NULL OR customer_id = auth.uid() OR public.is_owner()
);

CREATE POLICY "Reservations Update Policy" ON public.reservations 
FOR UPDATE USING (public.is_owner()) WITH CHECK (public.is_owner());

CREATE POLICY "Reservations Delete Policy" ON public.reservations 
FOR DELETE USING (public.is_owner());

-- FEEDBACK
CREATE POLICY "Feedback Select Policy" ON public.feedback 
FOR SELECT USING (
  public.is_owner() 
  OR customer_id = auth.uid() 
  OR customer_id IS NULL
);

CREATE POLICY "Feedback Insert Policy" ON public.feedback 
FOR INSERT WITH CHECK (
  (customer_id IS NULL OR customer_id = auth.uid() OR public.is_owner())
);

CREATE POLICY "Feedback Update Policy" ON public.feedback 
FOR UPDATE USING (public.is_owner()) WITH CHECK (public.is_owner());

CREATE POLICY "Feedback Delete Policy" ON public.feedback 
FOR DELETE USING (public.is_owner());

-- 13. Enable Supabase Realtime for required tables (orders, menu_items, reservations)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'reservations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
  END IF;
END $$;

