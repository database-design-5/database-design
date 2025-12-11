'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'KO' | 'EN' | 'ZH' | 'JA'

type Translations = {
    [key in Language]: {
        cart: string
        addToCart: string
        viewCart: string
        total: string
        order: string
        orderProcessing: string
        orderComplete: string
        orderFailed: string
        loginRequired: string
        soldOut: string
        noMenu: string
        noImage: string
        emptyCart: string
        accessDenied: string
        notManager: string
        incomingOrders: string
        customer: string
        status: {
            PENDING: string
            COOKING: string
            READY: string
            COMPLETED: string
            CANCELED: string
        }
        auth: {
            login: string
            register: string
            email: string
            password: string
            name: string
            loginButton: string
            registerButton: string
            haveAccount: string
            noAccount: string
            logout: string
            loginSuccess: string
            registerSuccess: string
            error: string
            phoneNumber: string
            adminPassword: string
            verify: string
            selectCafeteria: string
            managerRegister: string
            customerRegister: string
            invalidAdminPassword: string
            registerTypeSelect: string
        }
        common: {
            edit: string
            save: string
            cancel: string
            delete: string
            add: string
            confirmDelete: string
            success: string
        }
        dashboard: {
            menuName: string
            price: string
            description: string
            dailyLimit: string
            location: string
            operatingHours: string
            addMenu: string
            editMenu: string
            editInfo: string
            closeDay: string
            closeDayConfirm: string
            salesChart: string
            topMenus: string
            week: string
            month: string
            year: string
        }
        mypage: {
            title: string
            orderHistory: string
            currentOrders: string
            paymentMethods: string
            addPaymentMethod: string
            noOrders: string
            noPaymentMethods: string
            logoutConfirm: string
            cardNumber: string
            expiry: string
            cvc: string
            cardHolder: string
            saveCard: string
        }
        notifications: {
            title: string
            noNotifications: string
            markAllRead: string
            newNotification: string
        }
    }
}

const translations: Translations = {
    KO: {
        cart: '장바구니',
        addToCart: '담기',
        viewCart: '장바구니 보기',
        total: '총 결제금액',
        order: '주문하기',
        orderProcessing: '주문 처리중...',
        orderComplete: '주문이 완료되었습니다!',
        orderFailed: '주문 실패',
        loginRequired: '로그인이 필요합니다.',
        soldOut: '품절',
        noMenu: '메뉴가 없습니다.',
        noImage: '이미지 없음',
        emptyCart: '장바구니가 비어있습니다.',
        accessDenied: '접근 거부',
        notManager: '매니저로 등록되지 않았습니다.',
        incomingOrders: '들어온 주문',
        customer: '고객',
        status: {
            PENDING: '대기중',
            COOKING: '조리중',
            READY: '준비완료',
            COMPLETED: '완료됨',
            CANCELED: '취소됨',
        },
        auth: {
            login: '로그인',
            register: '회원가입',
            email: '이메일',
            password: '비밀번호',
            name: '이름',
            loginButton: '로그인하기',
            registerButton: '가입하기',
            haveAccount: '이미 계정이 있으신가요? 로그인',
            noAccount: '계정이 없으신가요? 회원가입',
            logout: '로그아웃',
            loginSuccess: '로그인 성공',
            registerSuccess: '가입 성공! 이메일을 확인해주세요.',
            error: '오류 발생',
            phoneNumber: '전화번호',
            adminPassword: '관리자 비밀번호',
            verify: '확인',
            selectCafeteria: '담당 식당 선택',
            managerRegister: '매니저 회원가입',
            customerRegister: '일반 회원가입',
            invalidAdminPassword: '관리자 비밀번호가 올바르지 않습니다.',
            registerTypeSelect: '회원가입 유형 선택',
        },
        common: {
            edit: '수정',
            save: '저장',
            cancel: '취소',
            delete: '삭제',
            add: '추가',
            confirmDelete: '정말 삭제하시겠습니까?',
            success: '성공적으로 처리되었습니다.',
        },
        dashboard: {
            menuName: '메뉴명',
            price: '가격',
            description: '설명',
            dailyLimit: '일일 한정수량',
            location: '위치',
            operatingHours: '운영시간',
            addMenu: '메뉴 추가',
            editMenu: '메뉴 수정',
            editInfo: '정보 수정',
            closeDay: '마감하기',
            closeDayConfirm: '오늘 하루를 마감하시겠습니까? 일일 매출이 저장됩니다.',
            salesChart: '매출 통계',
            topMenus: '인기 메뉴',
            week: '주간',
            month: '월간',
            year: '연간',
        },
        mypage: {
            title: '마이페이지',
            orderHistory: '주문 내역',
            currentOrders: '현재 주문',
            paymentMethods: '결제 수단',
            addPaymentMethod: '결제 수단 추가',
            noOrders: '주문 내역이 없습니다.',
            noPaymentMethods: '등록된 결제 수단이 없습니다.',
            logoutConfirm: '로그아웃 하시겠습니까?',
            cardNumber: '카드 번호',
            expiry: '유효기간',
            cvc: 'CVC',
            cardHolder: '소유자명',
            saveCard: '카드 저장',
        },
        notifications: {
            title: '알림',
            noNotifications: '새로운 알림이 없습니다.',
            markAllRead: '모두 읽음으로 표시',
            newNotification: '새로운 알림',
        }
    },
    EN: {
        cart: 'Cart',
        addToCart: 'Add',
        viewCart: 'View Cart',
        total: 'Total',
        order: 'Place Order',
        orderProcessing: 'Processing...',
        orderComplete: 'Order placed successfully!',
        orderFailed: 'Order failed',
        loginRequired: 'Login required.',
        soldOut: 'Sold Out',
        noMenu: 'No menu items available.',
        noImage: 'No Image',
        emptyCart: 'Your cart is empty.',
        accessDenied: 'Access Denied',
        notManager: 'You are not registered as a manager.',
        incomingOrders: 'Incoming Orders',
        customer: 'Customer',
        status: {
            PENDING: 'Pending',
            COOKING: 'Cooking',
            READY: 'Ready',
            COMPLETED: 'Completed',
            CANCELED: 'Canceled',
        },
        auth: {
            login: 'Login',
            register: 'Sign Up',
            email: 'Email',
            password: 'Password',
            name: 'Name',
            loginButton: 'Sign In',
            registerButton: 'Sign Up',
            haveAccount: 'Already have an account? Login',
            noAccount: 'Don\'t have an account? Sign Up',
            logout: 'Logout',
            loginSuccess: 'Login Successful',
            registerSuccess: 'Registration Successful! Please check your email.',
            error: 'Error occurred',
            phoneNumber: 'Phone Number',
            adminPassword: 'Admin Password',
            verify: 'Verify',
            selectCafeteria: 'Select Cafeteria',
            managerRegister: 'Manager Sign Up',
            customerRegister: 'Customer Sign Up',
            invalidAdminPassword: 'Invalid Admin Password',
            registerTypeSelect: 'Select Registration Type',
        },
        common: {
            edit: 'Edit',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            add: 'Add',
            confirmDelete: 'Are you sure you want to delete?',
            success: 'Operation successful.',
        },
        dashboard: {
            menuName: 'Menu Name',
            price: 'Price',
            description: 'Description',
            dailyLimit: 'Daily Limit',
            location: 'Location',
            operatingHours: 'Operating Hours',
            addMenu: 'Add Menu',
            editMenu: 'Edit Menu',
            editInfo: 'Edit Info',
            closeDay: 'Close Day',
            closeDayConfirm: 'Are you sure you want to close the day? This will save the daily sales.',
            salesChart: 'Sales Chart',
            topMenus: 'Top Menus',
            week: 'Week',
            month: 'Month',
            year: 'Year',
        },
        mypage: {
            title: 'My Page',
            orderHistory: 'Order History',
            currentOrders: 'Current Orders',
            paymentMethods: 'Payment Methods',
            addPaymentMethod: 'Add Payment Method',
            noOrders: 'No order history.',
            noPaymentMethods: 'No payment methods saved.',
            logoutConfirm: 'Are you sure you want to logout?',
            cardNumber: 'Card Number',
            expiry: 'Expiry',
            cvc: 'CVC',
            cardHolder: 'Card Holder',
            saveCard: 'Save Card',
        },
        notifications: {
            title: 'Notifications',
            noNotifications: 'No new notifications.',
            markAllRead: 'Mark all as read',
            newNotification: 'New Notification',
        }
    },
    ZH: {
        cart: '购物车',
        addToCart: '添加',
        viewCart: '查看购物车',
        total: '总计',
        order: '下单',
        orderProcessing: '处理中...',
        orderComplete: '订单已提交！',
        orderFailed: '下单失败',
        loginRequired: '需要登录。',
        soldOut: '售罄',
        noMenu: '暂无菜单。',
        noImage: '无图片',
        emptyCart: '购物车是空的。',
        accessDenied: '拒绝访问',
        notManager: '您未注册为经理。',
        incomingOrders: '新订单',
        customer: '顾客',
        status: {
            PENDING: '待处理',
            COOKING: '烹饪中',
            READY: '准备就绪',
            COMPLETED: '已完成',
            CANCELED: '已取消',
        },
        auth: {
            login: '登录',
            register: '注册',
            email: '电子邮箱',
            password: '密码',
            name: '姓名',
            loginButton: '登录',
            registerButton: '注册',
            haveAccount: '已有账号？登录',
            noAccount: '没有账号？注册',
            logout: '退出登录',
            loginSuccess: '登录成功',
            registerSuccess: '注册成功！请检查您的邮箱。',
            error: '发生错误',
            phoneNumber: '电话号码',
            adminPassword: '管理员密码',
            verify: '验证',
            selectCafeteria: '选择食堂',
            managerRegister: '经理注册',
            customerRegister: '顾客注册',
            invalidAdminPassword: '管理员密码无效',
            registerTypeSelect: '选择注册类型',
        },
        common: {
            edit: '编辑',
            save: '保存',
            cancel: '取消',
            delete: '删除',
            add: '添加',
            confirmDelete: '确定要删除吗？',
            success: '操作成功。',
        },
        dashboard: {
            menuName: '菜名',
            price: '价格',
            description: '描述',
            dailyLimit: '每日限量',
            location: '位置',
            operatingHours: '营业时间',
            addMenu: '添加菜单',
            editMenu: '编辑菜单',
            editInfo: '编辑信息',
            closeDay: '每日结算',
            closeDayConfirm: '您确定要结束这一天吗？这将保存每日销售额。',
            salesChart: '销售图表',
            topMenus: '热门菜单',
            week: '周',
            month: '月',
            year: '年',
        },
        mypage: {
            title: '我的页面',
            orderHistory: '订单历史',
            currentOrders: '当前订单',
            paymentMethods: '支付方式',
            addPaymentMethod: '添加支付方式',
            noOrders: '无订单历史。',
            noPaymentMethods: '未保存支付方式。',
            logoutConfirm: '确定要退出吗？',
            cardNumber: '卡号',
            expiry: '有效期',
            cvc: 'CVC',
            cardHolder: '持卡人',
            saveCard: '保存卡片',
        },
        notifications: {
            title: '通知',
            noNotifications: '暂无新通知。',
            markAllRead: '全部标记为已读',
            newNotification: '新通知',
        }
    },
    JA: {
        cart: 'カート',
        addToCart: '追加',
        viewCart: 'カートを見る',
        total: '合計',
        order: '注文する',
        orderProcessing: '処理中...',
        orderComplete: '注文が完了しました！',
        orderFailed: '注文に失敗しました',
        loginRequired: 'ログインが必要です。',
        soldOut: '売り切れ',
        noMenu: 'メニューがありません。',
        noImage: '画像なし',
        emptyCart: 'カートは空です。',
        accessDenied: 'アクセス拒否',
        notManager: 'マネージャーとして登録されていません。',
        incomingOrders: '新規注文',
        customer: 'お客様',
        status: {
            PENDING: '待機中',
            COOKING: '調理中',
            READY: '準備完了',
            COMPLETED: '完了',
            CANCELED: 'キャンセル',
        },
        auth: {
            login: 'ログイン',
            register: '会員登録',
            email: 'メールアドレス',
            password: 'パスワード',
            name: '名前',
            loginButton: 'ログイン',
            registerButton: '登録する',
            haveAccount: 'アカウントをお持ちですか？ログイン',
            noAccount: 'アカウントをお持ちでないですか？登録',
            logout: 'ログアウト',
            loginSuccess: 'ログイン成功',
            registerSuccess: '登録成功！メールを確認してください。',
            error: 'エラーが発生しました',
            phoneNumber: '電話番号',
            adminPassword: '管理者パスワード',
            verify: '確認',
            selectCafeteria: '担当食堂の選択',
            managerRegister: 'マネージャー登録',
            customerRegister: '一般会員登録',
            invalidAdminPassword: '管理者パスワードが正しくありません。',
            registerTypeSelect: '登録タイプの選択',
        },
        common: {
            edit: '編集',
            save: '保存',
            cancel: 'キャンセル',
            delete: '削除',
            add: '追加',
            confirmDelete: '本当に削除しますか？',
            success: '操作が成功しました。',
        },
        dashboard: {
            menuName: 'メニュー名',
            price: '価格',
            description: '説明',
            dailyLimit: '1日限定数',
            location: '場所',
            operatingHours: '営業時間',
            addMenu: 'メニュー追加',
            editMenu: 'メニュー編集',
            editInfo: '情報編集',
            closeDay: '締め切り',
            closeDayConfirm: '一日の業務を終了しますか？日次売上が保存されます。',
            salesChart: '売上チャート',
            topMenus: '人気メニュー',
            week: '週',
            month: '月',
            year: '年',
        },
        mypage: {
            title: 'マイページ',
            orderHistory: '注文履歴',
            currentOrders: '現在の注文',
            paymentMethods: '決済手段',
            addPaymentMethod: '決済手段の追加',
            noOrders: '注文履歴がありません。',
            noPaymentMethods: '保存された決済手段がありません。',
            logoutConfirm: 'ログアウトしますか？',
            cardNumber: 'カード番号',
            expiry: '有効期限',
            cvc: 'CVC',
            cardHolder: '所有者名',
            saveCard: 'カード保存',
        },
        notifications: {
            title: '通知',
            noNotifications: '新しい通知はありません。',
            markAllRead: 'すべて既読にする',
            newNotification: '新しい通知',
        }
    },
}

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: Translations[Language]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('KO')

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
