import { createClient } from '@/lib/supabase/server'
import { RunsList } from '@/components/runs/RunsList'

export const dynamic = 'force-dynamic'

export default async function RunsPage() {
  const supabase = await createClient()

  const [{ data: runs }, { data: shoes }] = await Promise.all([
    supabase
      .from('runs')
      .select(
        `*, shoes:shoes_id ( id, brand, model, nickname )`
      )
      .order('date', { ascending: false }),
    supabase
      .from('shoes')
      .select('*')
      .order('brand', { ascending: true }),
  ])

  return <RunsList runs={runs ?? []} shoes={shoes ?? []} />
}
