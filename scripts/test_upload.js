const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const env = fs.readFileSync(path.resolve(__dirname,'..','.env'),'utf8')
const lines = env.split(/\r?\n/).filter(Boolean)
const map = {}
for(const l of lines){const [k,v]=l.split('='); map[k]=v}
const SUPABASE_URL = map.VITE_SUPABASE_URL
const SUPABASE_ANON = map.VITE_SUPABASE_ANON
if(!SUPABASE_URL || !SUPABASE_ANON) { console.error('Missing env'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function main(){
  try{
    // create small file
    const tmp = path.resolve(__dirname,'..','test-sample.bin')
    fs.writeFileSync(tmp, Buffer.alloc(1024, 0))
  // read as Buffer to avoid undici "duplex" streaming requirement in Node
  const file = fs.readFileSync(tmp)
    const filename = `test_${Date.now()}.bin`
    console.log('Uploading', filename)
    const upload = await supabase.storage.from('videos').upload(filename, file)
    console.log('upload response', upload)
    if(upload.error){ console.error('upload failed'); process.exit(1) }

    const urlRes = supabase.storage.from('videos').getPublicUrl(upload.data.path)
    console.log('getPublicUrl', urlRes)

    // try to insert
    const user = await supabase.auth.getUser()
    console.log('user', user)
    const userId = user.data?.user?.id || null
  const insert = { title: 'test sample', url: urlRes.data?.publicUrl || '', thumbnail: '', user_id: userId }
  const db = await supabase.from('videos').insert([insert]).select('*').single()
  console.log('db insert', db)
  }catch(e){ console.error('err', e) }
}

main()
