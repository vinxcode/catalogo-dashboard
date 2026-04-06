export type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export type ProductVariant = {
  id: string
  product_id: string
  name: string
  price: number
  is_active: boolean
  display_order: number
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
  category?: Category
  product_images?: ProductImage[]
  product_variants?: ProductVariant[]
}

export type ProductImage = {
  id: string
  product_id: string
  image_url: string
  display_order: number
  is_primary: boolean
  created_at: string
}

export type Slider = {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  link_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

export type StoreSetting = {
  id: string
  key: string
  value: string | null
  updated_at: string
}

export type StoreSettingsMap = {
  phone: string
  whatsapp: string
  facebook_url: string
  instagram_url: string
  tiktok_url: string
  address: string
  store_name: string
  [key: string]: string
}

export interface Database {
  public: {
    Tables: {
      categories: { 
        Row: Category; 
        Insert: Partial<Category>; 
        Update: Partial<Category>;
        Relationships: any[];
      }
      products: { 
        Row: Product; 
        Insert: Partial<Product>; 
        Update: Partial<Product>;
        Relationships: any[];
      }
      product_images: { 
        Row: ProductImage; 
        Insert: Partial<ProductImage>; 
        Update: Partial<ProductImage>;
        Relationships: any[];
      }
      product_variants: {
        Row: ProductVariant;
        Insert: Partial<ProductVariant>;
        Update: Partial<ProductVariant>;
        Relationships: any[];
      }
      sliders: { 
        Row: Slider; 
        Insert: Partial<Slider>; 
        Update: Partial<Slider>;
        Relationships: any[];
      }
      store_settings: { 
        Row: StoreSetting; 
        Insert: Partial<StoreSetting>; 
        Update: Partial<StoreSetting>;
        Relationships: any[];
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
