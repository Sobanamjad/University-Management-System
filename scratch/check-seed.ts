import { getPayload } from 'payload'
import config from '../src/payload.config'
import 'dotenv/config'

const check = async () => {
  const p = await getPayload({ config })
  const s4 = await p.findByID({ collection: 'students', id: 4 })
  console.log('Student 4 Detail:', JSON.stringify(s4, null, 2))
  process.exit(0)
}

check()
