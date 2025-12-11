import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Using anon key for now, ideally service role if RLS blocks
)

// Ideally use SERVICE_ROLE_KEY for seeding to bypass RLS, but user only gave ANON_KEY.
// If RLS is enabled and policies don't allow anon insert, this will fail.
// Assuming for now it might work or user can disable RLS / add policy.

const cafeterias = [
    { name: '51장국밥', location: 'Student Union 1F', operating_hours: '09:00 - 20:00' },
    { name: '값찌개', location: 'Student Union 1F', operating_hours: '09:00 - 20:00' },
    { name: '경성카츠', location: 'Student Union 2F', operating_hours: '10:00 - 20:00' },
    { name: '광뚝', location: 'Engineering Bldg', operating_hours: '09:00 - 19:00' },
    { name: '바비든든', location: 'Library B1', operating_hours: '08:00 - 19:00' },
    { name: '비비고고', location: 'Dormitory', operating_hours: '11:00 - 20:00' },
    { name: '뽀까뽀까', location: 'Student Union 1F', operating_hours: '10:00 - 19:00' },
    { name: '중식대장', location: 'Student Union 2F', operating_hours: '10:30 - 20:00' },
    { name: '포포420', location: 'Science Bldg', operating_hours: '09:00 - 18:00' },
    { name: '폭풍분식', location: 'Student Union 1F', operating_hours: '09:00 - 21:00' },
]

const menusData = {
    '51장국밥': [
        { name: '고기만국밥', price: 7900, stock: 'IN_STOCK' },
        { name: '공기밥', price: 1000, stock: 'IN_STOCK' },
        { name: '닭곰탕', price: 5900, stock: 'OUT_OF_STOCK' },
        { name: '닭칼국수', price: 5900, stock: 'OUT_OF_STOCK' },
        { name: '떡갈비', price: 2300, stock: 'IN_STOCK' },
        { name: '순대국', price: 7900, stock: 'IN_STOCK' },
        { name: '얼큰고기만국밥', price: 8900, stock: 'IN_STOCK' },
        { name: '얼큰순대국', price: 8900, stock: 'IN_STOCK' },
        { name: '육개장', price: 8900, stock: 'OUT_OF_STOCK' },
        { name: '육칼국수', price: 8900, stock: 'OUT_OF_STOCK' },
        { name: '편육', price: 2500, stock: 'IN_STOCK' },
    ],
    '값찌개': [
        { name: '공기밥', price: 1000, stock: 'IN_STOCK' },
        { name: '돼지김치찌개(공기밥포함)', price: 6500, stock: 'IN_STOCK' },
        { name: '된장찌개(공기밥포함)', price: 5900, stock: 'IN_STOCK' },
        { name: '바지락 순두부(공기밥포함)', price: 6600, stock: 'IN_STOCK' },
        { name: '부대김치찌개(공기밥포함)', price: 6500, stock: 'IN_STOCK' },
        { name: '순두부찌개(공기밥포함)', price: 5900, stock: 'IN_STOCK' },
        { name: '얼큰소고기찌개', price: 7900, stock: 'IN_STOCK' },
        { name: '짬뽕순두부찌개(공기밥포함)', price: 7400, stock: 'IN_STOCK' },
        { name: '햄 순두부(공기밥포함)', price: 6900, stock: 'IN_STOCK' },
    ],
    '경성카츠': [
        { name: '고구마치즈돈카츠', price: 8300, stock: 'IN_STOCK' },
        { name: '김치냄비우동', price: 5900, stock: 'IN_STOCK' },
        { name: '등심돈카츠', price: 7500, stock: 'IN_STOCK' },
        { name: '새우튀김 우동', price: 6900, stock: 'IN_STOCK' },
        { name: '우동', price: 4900, stock: 'IN_STOCK' },
        { name: '특 등심왕돈카츠', price: 8900, stock: 'IN_STOCK' },
    ],
    '광뚝': [
        { name: '간장 불고기', price: 7900, stock: 'IN_STOCK' },
        { name: '고추장 불고기', price: 7900, stock: 'IN_STOCK' },
        { name: '공기밥', price: 1000, stock: 'IN_STOCK' },
        { name: '광뚝사골칼국수', price: 5900, stock: 'IN_STOCK' },
        { name: '떡왕만두뚝배기', price: 7900, stock: 'IN_STOCK' },
        { name: '뚝배기알밥', price: 5900, stock: 'IN_STOCK' },
        { name: '물만두', price: 1900, stock: 'IN_STOCK' },
        { name: '부산물밀면', price: 6900, stock: 'IN_STOCK' },
        { name: '부산비빔밀면', price: 6900, stock: 'IN_STOCK' },
        { name: '칼왕만두뚝배기', price: 7900, stock: 'IN_STOCK' },
    ],
    '바비든든': [
        { name: '고기든든', price: 3900, stock: 'IN_STOCK' },
        { name: '고기든든(킹)', price: 5900, stock: 'IN_STOCK' },
        { name: '스팸마요덮밥(라지)', price: 4900, stock: 'IN_STOCK' },
        { name: '제육덮밥', price: 3900, stock: 'IN_STOCK' },
        { name: '제육덮밥(킹)', price: 5900, stock: 'IN_STOCK' },
        { name: '참치마요덮밥(라지)', price: 4900, stock: 'IN_STOCK' },
        { name: '춘천닭갈비덮밥(킹)', price: 5900, stock: 'IN_STOCK' },
        { name: '치킨마요덮밥(라지)', price: 4900, stock: 'IN_STOCK' },
    ],
    '비비고고': [
        { name: '기본카레', price: 4900, stock: 'IN_STOCK' },
        { name: '기본카레(품절)', price: 4900, stock: 'OUT_OF_STOCK' },
        { name: '불고기비빔밥', price: 7500, stock: 'IN_STOCK' },
        { name: '불고기카레', price: 6900, stock: 'IN_STOCK' },
        { name: '비프 카레', price: 6900, stock: 'OUT_OF_STOCK' },
        { name: '새우카레', price: 6900, stock: 'IN_STOCK' },
        { name: '새우튀김카레', price: 6900, stock: 'OUT_OF_STOCK' },
        { name: '신카레', price: 5500, stock: 'OUT_OF_STOCK' },
        { name: '오색비빔밥', price: 6500, stock: 'IN_STOCK' },
        { name: '육회비빔밥', price: 7900, stock: 'IN_STOCK' },
        { name: '치킨 가라아게 카레', price: 6900, stock: 'OUT_OF_STOCK' },
        { name: '치킨카레', price: 6900, stock: 'IN_STOCK' },
    ],
    '뽀까뽀까': [
        { name: '계란쫑볶음밥', price: 3900, stock: 'IN_STOCK' },
        { name: '계란쫑볶음밥+음료', price: 5500, stock: 'IN_STOCK' },
        { name: '계란쫑볶음밥+제육+음료set', price: 7500, stock: 'IN_STOCK' },
        { name: '계란쫑볶음밥+제육set', price: 5900, stock: 'IN_STOCK' },
        { name: '김치볶음밥', price: 3900, stock: 'IN_STOCK' },
        { name: '김치볶음밥+음료', price: 5500, stock: 'IN_STOCK' },
        { name: '김치볶음밥+제육+음료set', price: 7500, stock: 'IN_STOCK' },
        { name: '김치볶음밥+제육set', price: 5900, stock: 'IN_STOCK' },
        { name: '달콤치즈감자튀김', price: 1500, stock: 'IN_STOCK' },
        { name: '오므라이스', price: 4900, stock: 'IN_STOCK' },
        { name: '음료', price: 0, stock: 'IN_STOCK' },
        { name: '참치김치볶음밥', price: 4900, stock: 'IN_STOCK' },
        { name: '참치김치볶음밥+음료', price: 6500, stock: 'IN_STOCK' },
        { name: '참치김치볶음밥+제육 set', price: 6900, stock: 'IN_STOCK' },
        { name: '참치김치볶음밥+제육+음료set', price: 8500, stock: 'IN_STOCK' },
        { name: '카오팟무', price: 6500, stock: 'IN_STOCK' },
        { name: '콘치즈', price: 2000, stock: 'IN_STOCK' },
    ],
    '중식대장': [
        { name: '계란볶음밥', price: 6500, stock: 'IN_STOCK' },
        { name: '공기밥', price: 1000, stock: 'IN_STOCK' },
        { name: '달인볶음밥', price: 6500, stock: 'OUT_OF_STOCK' },
        { name: '달인짜장', price: 5900, stock: 'OUT_OF_STOCK' },
        { name: '달인짬뽕', price: 6900, stock: 'OUT_OF_STOCK' },
        { name: '달인탕수육', price: 9900, stock: 'OUT_OF_STOCK' },
        { name: '마파덮밥', price: 6500, stock: 'IN_STOCK' },
        { name: '미니탕수육', price: 5900, stock: 'IN_STOCK' },
        { name: '소고기 해물 짬뽕', price: 7900, stock: 'IN_STOCK' },
        { name: '짜장면', price: 5900, stock: 'IN_STOCK' },
        { name: '짬뽕밥', price: 8500, stock: 'IN_STOCK' },
        { name: '크림짬뽕', price: 7900, stock: 'IN_STOCK' },
    ],
    '포포420': [
        { name: '마라우삼겹쌀국수', price: 6500, stock: 'IN_STOCK' },
        { name: '새우빠스(2p)', price: 2500, stock: 'IN_STOCK' },
        { name: '야채춘권(3p)', price: 1000, stock: 'IN_STOCK' },
        { name: '얼큰해산물쌀국수', price: 7500, stock: 'IN_STOCK' },
        { name: '우삼겹쌀국수', price: 5900, stock: 'IN_STOCK' },
        { name: '포포쌀국수(고기없음)', price: 4900, stock: 'IN_STOCK' },
    ],
    '폭풍분식': [
        { name: '날치알주먹밥', price: 3800, stock: 'IN_STOCK' },
        { name: '떡라면', price: 3900, stock: 'IN_STOCK' },
        { name: '라면 + 날치알 주먹밥 SET', price: 6500, stock: 'IN_STOCK' },
        { name: '라면 + 직화구이 SET', price: 5500, stock: 'IN_STOCK' },
        { name: '라면 + 참치김치주먹밥 SET', price: 6500, stock: 'IN_STOCK' },
        { name: '만두라면', price: 4300, stock: 'IN_STOCK' },
        { name: '직화 양념 구이', price: 2500, stock: 'IN_STOCK' },
        { name: '쫄면', price: 5900, stock: 'IN_STOCK' },
        { name: '쫄면 + 직화구이 SET', price: 7900, stock: 'IN_STOCK' },
        { name: '참치김치주먹밥', price: 3800, stock: 'IN_STOCK' },
        { name: '폭풍 떡볶이', price: 3500, stock: 'OUT_OF_STOCK' },
    ],
}

async function seed() {
    console.log('Seeding cafeterias...')

    const cafeteriaIds: Record<string, number> = {}

    for (const caf of cafeterias) {
        // Check if exists
        const { data: existing } = await supabase
            .from('cafeterias')
            .select('cafeteria_id')
            .eq('name', caf.name)
            .single()

        if (existing) {
            cafeteriaIds[caf.name] = existing.cafeteria_id
        } else {
            const { data: newCaf, error } = await supabase
                .from('cafeterias')
                .insert(caf)
                .select()
                .single()

            if (error) {
                console.error(`Error creating cafeteria ${caf.name}:`, error)
            } else {
                cafeteriaIds[caf.name] = newCaf.cafeteria_id
            }
        }
    }

    console.log('Seeding menus...')
    for (const [cafName, menus] of Object.entries(menusData)) {
        const cafeteriaId = cafeteriaIds[cafName]
        if (!cafeteriaId) {
            console.warn(`Cafeteria ${cafName} not found, skipping menus.`)
            continue
        }

        for (const menu of menus) {
            const { error } = await supabase
                .from('menus')
                .insert({
                    cafeteria_id: cafeteriaId,
                    menu_name: menu.name,
                    price: menu.price,
                    stock_status: menu.stock,
                    image_url: `https://placehold.co/600x400?text=${encodeURIComponent(menu.name)}`, // Placeholder image
                    description: `${menu.name} - Delicious food at ${cafName}`
                })

            if (error) {
                console.error(`Error inserting menu ${menu.name}:`, error)
            }
        }
    }

    console.log('Seeding completed.')
}

seed()
