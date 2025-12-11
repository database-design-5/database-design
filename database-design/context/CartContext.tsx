'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type CartItem = {
    menuId: number
    menuName: string
    price: number
    quantity: number
    cafeteriaId: number
    cafeteriaName: string
}

type CartContextType = {
    items: CartItem[]
    addToCart: (item: Omit<CartItem, 'quantity'>) => void
    removeFromCart: (menuId: number) => void
    updateQuantity: (menuId: number, quantity: number) => void
    clearCart: () => void
    totalPrice: number
    totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Failed to parse cart from local storage', e)
            }
        }
    }, [])

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.menuId === newItem.menuId)
            if (existingItem) {
                return prevItems.map((item) =>
                    item.menuId === newItem.menuId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prevItems, { ...newItem, quantity: 1 }]
        })
    }

    const removeFromCart = (menuId: number) => {
        setItems((prevItems) => prevItems.filter((item) => item.menuId !== menuId))
    }

    const updateQuantity = (menuId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(menuId)
            return
        }
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.menuId === menuId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalPrice,
                totalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
