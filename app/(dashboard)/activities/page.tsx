import { createClient } from '@/lib/supabase/server'
import { ActivitiesTable } from '@/components/activities/ActivitiesTable'

export const dynamic = 'force-dynamic'

export default async function ActivitiesPage() {
  const supabase = await createClient()

  const [{ data: runs }, { data: shoes }] = await Promise.all([
    supabase
      .from('runs')
      .select('*, shoes:shoes_id ( id, brand, model, nickname )')
      .order('date', { ascending: false }),
    supabase
      .from('shoes')
      .select('*')
      .order('brand', { ascending: true }),
  ])

  return <ActivitiesTable runs={runs ?? []} shoes={shoes ?? []} />
}
