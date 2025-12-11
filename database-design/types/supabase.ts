export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            cafeterias: {
                Row: {
                    cafeteria_id: number
                    name: string
                    status: string | null
                    location: string | null
                    operating_hours: string | null
                    created_at: string | null
                }
                Insert: {
                    cafeteria_id?: number
                    name: string
                    status?: string | null
                    location?: string | null
                    operating_hours?: string | null
                    created_at?: string | null
                }
                Update: {
                    cafeteria_id?: number
                    name?: string
                    status?: string | null
                    location?: string | null
                    operating_hours?: string | null
                    created_at?: string | null
                }
            }
            managers: {
                Row: {
                    manager_id: string
                    cafeteria_id: number | null
                    name: string
                    phone_number: string | null
                    created_at: string | null
                }
                Insert: {
                    manager_id: string
                    cafeteria_id?: number | null
                    name: string
                    phone_number?: string | null
                    created_at?: string | null
                }
                Update: {
                    manager_id?: string
                    cafeteria_id?: number | null
                    name?: string
                    phone_number?: string | null
                    created_at?: string | null
                }
            }
            customers: {
                Row: {
                    customer_id: string
                    email: string
                    name: string | null
                    phone_number: string | null
                    created_at: string | null
                }
                Insert: {
                    customer_id: string
                    email: string
                    name?: string | null
                    phone_number?: string | null
                    created_at?: string | null
                }
                Update: {
                    customer_id?: string
                    email?: string
                    name?: string | null
                    phone_number?: string | null
                    created_at?: string | null
                }
            }
            menus: {
                Row: {
                    menu_id: number
                    cafeteria_id: number
                    menu_name: string
                    price: number
                    description: string | null
                    image_url: string | null
                    stock_status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED' | null
                    daily_limit: number | null
                    created_at: string | null
                }
                Insert: {
                    menu_id?: number
                    cafeteria_id: number
                    menu_name: string
                    price: number
                    description?: string | null
                    image_url?: string | null
                    stock_status?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED' | null
                    daily_limit?: number | null
                    created_at?: string | null
                }
                Update: {
                    menu_id?: number
                    cafeteria_id?: number
                    menu_name?: string
                    price?: number
                    description?: string | null
                    image_url?: string | null
                    stock_status?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED' | null
                    daily_limit?: number | null
                    created_at?: string | null
                }
            }
            orders: {
                Row: {
                    order_id: number
                    customer_id: string
                    cafeteria_id: number
                    order_status: 'PENDING' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELED' | null
                    total_amount: number
                    payment_method: string
                    created_at: string | null
                }
                Insert: {
                    order_id?: number
                    customer_id: string
                    cafeteria_id: number
                    order_status?: 'PENDING' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELED' | null
                    total_amount: number
                    payment_method: string
                    created_at?: string | null
                }
                Update: {
                    order_id?: number
                    customer_id?: string
                    cafeteria_id?: number
                    order_status?: 'PENDING' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELED' | null
                    total_amount?: number
                    payment_method?: string
                    created_at?: string | null
                }
            }
            order_details: {
                Row: {
                    order_detail_id: number
                    order_id: number | null
                    menu_id: number | null
                    quantity: number
                    unit_price: number
                    subtotal: number
                    created_at: string | null
                }
                Insert: {
                    order_detail_id?: number
                    order_id?: number | null
                    menu_id?: number | null
                    quantity: number
                    unit_price: number
                    subtotal: number
                    created_at?: string | null
                }
                Update: {
                    order_detail_id?: number
                    order_id?: number | null
                    menu_id?: number | null
                    quantity?: number
                    unit_price?: number
                    subtotal?: number
                    created_at?: string | null
                }
            }
            sales: {
                Row: {
                    sales_id: number
                    cafeteria_id: number | null
                    sales_date: string
                    total_orders: number | null
                    total_sales: number | null
                    menu_sales_data: Json | null
                    hourly_sales_data: Json | null
                    created_at: string | null
                }
                Insert: {
                    sales_id?: number
                    cafeteria_id?: number | null
                    sales_date: string
                    total_orders?: number | null
                    total_sales?: number | null
                    menu_sales_data?: Json | null
                    hourly_sales_data?: Json | null
                    created_at?: string | null
                }
                Update: {
                    sales_id?: number
                    cafeteria_id?: number | null
                    sales_date?: string
                    total_orders?: number | null
                    total_sales?: number | null
                    menu_sales_data?: Json | null
                    hourly_sales_data?: Json | null
                    created_at?: string | null
                }
            }
            notifications: {
                Row: {
                    notification_id: number
                    customer_id: string | null
                    order_id: number | null
                    message: string
                    is_read: boolean | null
                    created_at: string | null
                }
                Insert: {
                    notification_id?: number
                    customer_id?: string | null
                    order_id?: number | null
                    message: string
                    is_read?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    notification_id?: number
                    customer_id?: string | null
                    order_id?: number | null
                    message?: string
                    is_read?: boolean | null
                    created_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            order_status_type: 'PENDING' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELED'
            stock_status_type: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED'
        }
    }
}
