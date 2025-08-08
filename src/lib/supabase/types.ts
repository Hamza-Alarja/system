export type Database = {
  public: {
    Tables: {
      users: {  // تغيير من profiles إلى users
        Row: {
          id: string
          auth_user_id: string  // إضافة هذا الحقل
          role: 'owner' | 'accountant' | 'manager' | string  // يمكن إضافة string للدور المخصص
          created_at?: string  // إضافة حقول أخرى إذا لزم الأمر
          updated_at?: string
        }
        Insert: {  // إضافة نوع Insert للعمليات الإنشائية
          id?: string
          auth_user_id: string
          role: 'owner' | 'accountant' | 'manager' | string
          created_at?: string
          updated_at?: string
        }
        Update: {  // إضافة نوع Update للعمليات التحديثية
          id?: string
          auth_user_id?: string
          role?: 'owner' | 'accountant' | 'manager' | string
          updated_at?: string
        }
      }
    }
  }
}