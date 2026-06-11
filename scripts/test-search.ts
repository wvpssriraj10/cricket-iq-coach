import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testQuery(queryStr: string) {
  console.log(`Testing query: ${queryStr}`)
  const { data, error } = await supabase
    .from('players')
    .select('id, name')
    .ilike('name', `%${queryStr}%`)
    .limit(10)
    
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Results:', data)
  }
}

testQuery('W.V.P.S.SRIRAJ')
testQuery('SRIRAJ')
testQuery('w.v.p.s')
testQuery('W.V.P.S')
