import {createServer} from 'node:http';
import {mkdir,writeFile} from 'node:fs/promises';

const output=new URL('../../../outputs/whole-robots/mechanisms/',import.meta.url);
const server=createServer(async(request,response)=>{
  response.setHeader('Access-Control-Allow-Origin','*');
  response.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(request.method==='OPTIONS'){response.writeHead(204);response.end();return;}
  const match=/^\/(robot-R(?:0[1-9]|10)(?:-(?:score|stow|floor|station|coral|algae|climb))?\.png|viewer-(?:desktop|mobile)\.png|intake-(?:0[1-9]|1[0-4])-(?:open|collapsed|handoff)\.png|(?:intake|context)-ui-(?:desktop|mobile)\.png|task-R(?:0[1-9]|10)-(?:stow|coral-(?:floor|station|l[1-4])|algae-(?:floor|low|high)|processor|net|climb|park)(?:-(?:approach|release|detail))?\.png)$/.exec(request.url);
  if(request.method!=='POST'||!match){response.writeHead(404);response.end();return;}
  try{
    const chunks=[];let length=0;
    for await(const chunk of request){length+=chunk.length;if(length>8_000_000)throw new Error('Image too large');chunks.push(chunk);}
    const bytes=Buffer.concat(chunks);
    if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Expected PNG');
    const destination=match[1].startsWith('task-')?new URL('interactions/',output):match[1].startsWith('intake-')?new URL('../../../outputs/concepts/mechanisms/',import.meta.url):match[1].startsWith('context-ui-')||/-(stow|floor|station|coral|algae|climb)\.png$/.test(match[1])?new URL('states/',output):output;
    await mkdir(destination,{recursive:true});
    await writeFile(new URL(match[1],destination),bytes);
    response.writeHead(200,{'Content-Type':'application/json'});response.end(JSON.stringify({file:match[1],bytes:length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}));
    console.log(`Saved ${match[1]} (${length} bytes)`);
  }catch(error){response.writeHead(400);response.end(error.message);}
});
server.listen(49174,'127.0.0.1',()=>console.log('Temporary PNG export receiver: http://127.0.0.1:49174; loopback only.'));