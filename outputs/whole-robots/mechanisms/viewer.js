(()=>{var li={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},ci={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},ph=0,Pl=1,fh=2;var Ll=1,Na=2,Nn=3,Xn=0,Gt=1,$t=2,$n=0,wi=1,Il=2,Dl=3,Nl=4,mh=5,si=100,gh=101,yh=102,_h=103,vh=104,xh=200,bh=201,Mh=202,wh=203,ra=204,sa=205,Sh=206,Eh=207,Th=208,Ah=209,Ch=210,Rh=211,Ph=212,Lh=213,Ih=214,Ua=0,Fa=1,Oa=2,Si=3,ka=4,Ba=5,za=6,Ha=7,Ul=0,Dh=1,Nh=2,Zn=0,Uh=1,Fh=2,Oh=3,Va=4,kh=5,Bh=6,zh=7;var Fl=300,Ii=301,Di=302,Ga=303,Wa=304,_s=306,aa=1e3,ri=1001,oa=1002,un=1003,Hh=1004;var vs=1005;var xn=1006,Xa=1007;var hi=1008;var Tn=1009,Ol=1010,kl=1011,gr=1012,qa=1013,di=1014,Un=1015,yr=1016,Ya=1017,$a=1018,_r=1020,Bl=35902,zl=35899,Hl=1021,Vl=1022,pn=1023,sr=1026,vr=1027,Gl=1028,Za=1029,Wl=1030,Ja=1031;var Ka=1033,xs=33776,bs=33777,Ms=33778,ws=33779,ja=35840,Qa=35841,eo=35842,to=35843,no=36196,io=37492,ro=37496,so=37808,ao=37809,oo=37810,lo=37811,co=37812,ho=37813,uo=37814,po=37815,fo=37816,mo=37817,go=37818,yo=37819,_o=37820,vo=37821,xo=36492,bo=36494,Mo=36495,wo=36283,So=36284,Eo=36285,To=36286;var Vr=2300,la=2301,ia=2302,_l=2400,vl=2401,xl=2402;var Vh=3200,Gh=3201;var Xl=0,Wh=1,Jn="",Vt="srgb",Ei="srgb-linear",Gr="linear",it="srgb";var bi=7680;var bl=519,Xh=512,qh=513,Yh=514,ql=515,$h=516,Zh=517,Jh=518,Kh=519,Ml=35044;var Yl="300 es",vn=2e3,Wr=2001;var Rn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}},Ft=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Bc=1234567,ir=Math.PI/180,ar=180/Math.PI;function Ni(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ft[i&255]+Ft[i>>8&255]+Ft[i>>16&255]+Ft[i>>24&255]+"-"+Ft[e&255]+Ft[e>>8&255]+"-"+Ft[e>>16&15|64]+Ft[e>>24&255]+"-"+Ft[t&63|128]+Ft[t>>8&255]+"-"+Ft[t>>16&255]+Ft[t>>24&255]+Ft[n&255]+Ft[n>>8&255]+Ft[n>>16&255]+Ft[n>>24&255]).toLowerCase()}function Ge(i,e,t){return Math.max(e,Math.min(t,i))}function $l(i,e){return(i%e+e)%e}function yu(i,e,t,n,r){return n+(i-e)*(r-n)/(t-e)}function _u(i,e,t){return i!==e?(t-i)/(e-i):0}function Br(i,e,t){return(1-t)*i+t*e}function vu(i,e,t,n){return Br(i,e,1-Math.exp(-t*n))}function xu(i,e=1){return e-Math.abs($l(i,e*2)-e)}function bu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Mu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function wu(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Su(i,e){return i+Math.random()*(e-i)}function Eu(i){return i*(.5-Math.random())}function Tu(i){i!==void 0&&(Bc=i);let e=Bc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Au(i){return i*ir}function Cu(i){return i*ar}function Ru(i){return(i&i-1)===0&&i!==0}function Pu(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Lu(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Iu(i,e,t,n,r){let s=Math.cos,a=Math.sin,o=s(t/2),l=a(t/2),c=s((e+n)/2),h=a((e+n)/2),d=s((e-n)/2),u=a((e-n)/2),f=s((n-e)/2),g=a((n-e)/2);switch(r){case"XYX":i.set(o*h,l*d,l*u,o*c);break;case"YZY":i.set(l*u,o*h,l*d,o*c);break;case"ZXZ":i.set(l*d,l*u,o*h,o*c);break;case"XZX":i.set(o*h,l*g,l*f,o*c);break;case"YXY":i.set(l*f,o*h,l*g,o*c);break;case"ZYZ":i.set(l*g,l*f,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function nr(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ht(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Ct={DEG2RAD:ir,RAD2DEG:ar,generateUUID:Ni,clamp:Ge,euclideanModulo:$l,mapLinear:yu,inverseLerp:_u,lerp:Br,damp:vu,pingpong:xu,smoothstep:bu,smootherstep:Mu,randInt:wu,randFloat:Su,randFloatSpread:Eu,seededRandom:Tu,degToRad:Au,radToDeg:Cu,isPowerOfTwo:Ru,ceilPowerOfTwo:Pu,floorPowerOfTwo:Lu,setQuaternionFromProperEuler:Iu,normalize:Ht,denormalize:nr},ce=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ge(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ge(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*r+e.x,this.y=s*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Dt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,a,o){let l=n[r+0],c=n[r+1],h=n[r+2],d=n[r+3],u=s[a+0],f=s[a+1],g=s[a+2],y=s[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d;return}if(o===1){e[t+0]=u,e[t+1]=f,e[t+2]=g,e[t+3]=y;return}if(d!==y||l!==u||c!==f||h!==g){let m=1-o,p=l*u+c*f+h*g+d*y,E=p>=0?1:-1,w=1-p*p;if(w>Number.EPSILON){let R=Math.sqrt(w),C=Math.atan2(R,p*E);m=Math.sin(m*C)/R,o=Math.sin(o*C)/R}let v=o*E;if(l=l*m+u*v,c=c*m+f*v,h=h*m+g*v,d=d*m+y*v,m===1-o){let R=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=R,c*=R,h*=R,d*=R}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,r,s,a){let o=n[r],l=n[r+1],c=n[r+2],h=n[r+3],d=s[a],u=s[a+1],f=s[a+2],g=s[a+3];return e[t]=o*g+h*d+l*f-c*u,e[t+1]=l*g+h*u+c*d-o*f,e[t+2]=c*g+h*f+o*u-l*d,e[t+3]=h*g-o*d-l*u-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(r/2),d=o(s/2),u=l(n/2),f=l(r/2),g=l(s/2);switch(a){case"XYZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"YZX":this._x=u*h*d+c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d-u*f*g;break;case"XZY":this._x=u*h*d-c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d+u*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=n+o+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(a-r)*f}else if(n>o&&n>d){let f=2*Math.sqrt(1+n-o-d);this._w=(h-l)/f,this._x=.25*f,this._y=(r+a)/f,this._z=(s+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-n-d);this._w=(s-c)/f,this._x=(r+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+d-n-o);this._w=(a-r)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ge(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+r*c-s*l,this._y=r*h+a*l+s*o-n*c,this._z=s*h+a*c+n*l-r*o,this._w=a*h-n*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,s=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=s,this;let l=1-o*o;if(l<=Number.EPSILON){let f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,o),d=Math.sin((1-t)*h)/c,u=Math.sin(t*h)/c;return this._w=a*d+this._w*u,this._x=n*d+this._x*u,this._y=r*d+this._y*u,this._z=s*d+this._z*u,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},T=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(zc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(zc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*r-o*n),h=2*(o*t-s*r),d=2*(s*n-a*t);return this.x=t+l*c+a*d-o*h,this.y=n+l*h+o*c-s*d,this.z=r+l*d+s*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this.z=Ge(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this.z=Ge(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ge(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=r*l-s*o,this.y=s*a-n*l,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Xo.copy(this).projectOnVector(e),this.sub(Xo)}reflect(e){return this.sub(Xo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ge(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Xo=new T,zc=new Dt,ze=class i{constructor(e,t,n,r,s,a,o,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,c)}set(e,t,n,r,s,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=r,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],f=n[5],g=n[8],y=r[0],m=r[3],p=r[6],E=r[1],w=r[4],v=r[7],R=r[2],C=r[5],L=r[8];return s[0]=a*y+o*E+l*R,s[3]=a*m+o*w+l*C,s[6]=a*p+o*v+l*L,s[1]=c*y+h*E+d*R,s[4]=c*m+h*w+d*C,s[7]=c*p+h*v+d*L,s[2]=u*y+f*E+g*R,s[5]=u*m+f*w+g*C,s[8]=u*p+f*v+g*L,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*s*h+n*o*l+r*s*c-r*a*l}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,u=o*l-h*s,f=c*s-a*l,g=t*d+n*u+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return e[0]=d*y,e[1]=(r*c-h*n)*y,e[2]=(o*n-r*a)*y,e[3]=u*y,e[4]=(h*t-r*l)*y,e[5]=(r*s-o*t)*y,e[6]=f*y,e[7]=(n*l-c*t)*y,e[8]=(a*t-n*s)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,a,o){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(qo.makeScale(e,t)),this}rotate(e){return this.premultiply(qo.makeRotation(-e)),this}translate(e,t){return this.premultiply(qo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},qo=new ze;function Zl(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Xr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function jh(){let i=Xr("canvas");return i.style.display="block",i}var Hc={};function or(i){i in Hc||(Hc[i]=!0,console.warn(i))}function Qh(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}var Vc=new ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Gc=new ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Du(){let i={enabled:!0,workingColorSpace:Ei,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===it&&(r.r=Wn(r.r),r.g=Wn(r.g),r.b=Wn(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===it&&(r.r=rr(r.r),r.g=rr(r.g),r.b=rr(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Jn?Gr:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return or("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return or("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Ei]:{primaries:e,whitePoint:n,transfer:Gr,toXYZ:Vc,fromXYZ:Gc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Vt},outputColorSpaceConfig:{drawingBufferColorSpace:Vt}},[Vt]:{primaries:e,whitePoint:n,transfer:it,toXYZ:Vc,fromXYZ:Gc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Vt}}}),i}var je=Du();function Wn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function rr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Wi,ca=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Wi===void 0&&(Wi=Xr("canvas")),Wi.width=e.width,Wi.height=e.height;let r=Wi.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=Wi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Xr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=Wn(s[a]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Wn(t[n]/255)*255):t[n]=Wn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Nu=0,lr=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Nu++}),this.uuid=Ni(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Yo(r[a].image)):s.push(Yo(r[a]))}else s=Yo(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function Yo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ca.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Uu=0,$o=new T,rn=class i extends Rn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=ri,r=ri,s=xn,a=hi,o=pn,l=Tn,c=i.DEFAULT_ANISOTROPY,h=Jn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Uu++}),this.uuid=Ni(),this.name="",this.source=new lr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ce(0,0),this.repeat=new ce(1,1),this.center=new ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize($o).x}get height(){return this.source.getSize($o).y}get depth(){return this.source.getSize($o).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Fl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case aa:e.x=e.x-Math.floor(e.x);break;case ri:e.x=e.x<0?0:1;break;case oa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case aa:e.y=e.y-Math.floor(e.y);break;case ri:e.y=e.y<0?0:1;break;case oa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};rn.DEFAULT_IMAGE=null;rn.DEFAULT_MAPPING=Fl;rn.DEFAULT_ANISOTROPY=1;var vt=class i{constructor(e=0,t=0,n=0,r=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],g=l[9],y=l[2],m=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+y)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(c+1)/2,v=(f+1)/2,R=(p+1)/2,C=(h+u)/4,L=(d+y)/4,D=(g+m)/4;return w>v&&w>R?w<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(w),r=C/n,s=L/n):v>R?v<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),n=C/r,s=D/r):R<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),n=L/s,r=D/s),this.set(n,r,s,t),this}let E=Math.sqrt((m-g)*(m-g)+(d-y)*(d-y)+(u-h)*(u-h));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(d-y)/E,this.z=(u-h)/E,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this.z=Ge(this.z,e.z,t.z),this.w=Ge(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this.z=Ge(this.z,e,t),this.w=Ge(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ge(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ha=class extends Rn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:xn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t);let r={width:e,height:t,depth:n.depth},s=new rn(r);this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:xn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new lr(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Pn=class extends ha{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},qr=class extends rn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var da=class extends rn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Yt=class{constructor(e=new T(1/0,1/0,1/0),t=new T(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(gn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(gn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=gn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,gn):gn.fromBufferAttribute(s,a),gn.applyMatrix4(e.matrixWorld),this.expandByPoint(gn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ls.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ls.copy(n.boundingBox)),Ls.applyMatrix4(e.matrixWorld),this.union(Ls)}let r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,gn),gn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Dr),Is.subVectors(this.max,Dr),Xi.subVectors(e.a,Dr),qi.subVectors(e.b,Dr),Yi.subVectors(e.c,Dr),jn.subVectors(qi,Xi),Qn.subVectors(Yi,qi),yi.subVectors(Xi,Yi);let t=[0,-jn.z,jn.y,0,-Qn.z,Qn.y,0,-yi.z,yi.y,jn.z,0,-jn.x,Qn.z,0,-Qn.x,yi.z,0,-yi.x,-jn.y,jn.x,0,-Qn.y,Qn.x,0,-yi.y,yi.x,0];return!Zo(t,Xi,qi,Yi,Is)||(t=[1,0,0,0,1,0,0,0,1],!Zo(t,Xi,qi,Yi,Is))?!1:(Ds.crossVectors(jn,Qn),t=[Ds.x,Ds.y,Ds.z],Zo(t,Xi,qi,Yi,Is))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,gn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(gn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(kn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},kn=[new T,new T,new T,new T,new T,new T,new T,new T],gn=new T,Ls=new Yt,Xi=new T,qi=new T,Yi=new T,jn=new T,Qn=new T,yi=new T,Dr=new T,Is=new T,Ds=new T,_i=new T;function Zo(i,e,t,n,r){for(let s=0,a=i.length-3;s<=a;s+=3){_i.fromArray(i,s);let o=r.x*Math.abs(_i.x)+r.y*Math.abs(_i.y)+r.z*Math.abs(_i.z),l=e.dot(_i),c=t.dot(_i),h=n.dot(_i);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Fu=new Yt,Nr=new T,Jo=new T,Ti=class{constructor(e=new T,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Fu.setFromPoints(e).getCenter(n);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Nr.subVectors(e,this.center);let t=Nr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Nr,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Jo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Nr.copy(e.center).add(Jo)),this.expandByPoint(Nr.copy(e.center).sub(Jo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Bn=new T,Ko=new T,Ns=new T,ei=new T,jo=new T,Us=new T,Qo=new T,Ai=class{constructor(e=new T,t=new T(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Bn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Bn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Bn.copy(this.origin).addScaledVector(this.direction,t),Bn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Ko.copy(e).add(t).multiplyScalar(.5),Ns.copy(t).sub(e).normalize(),ei.copy(this.origin).sub(Ko);let s=e.distanceTo(t)*.5,a=-this.direction.dot(Ns),o=ei.dot(this.direction),l=-ei.dot(Ns),c=ei.lengthSq(),h=Math.abs(1-a*a),d,u,f,g;if(h>0)if(d=a*l-o,u=a*o-l,g=s*h,d>=0)if(u>=-g)if(u<=g){let y=1/h;d*=y,u*=y,f=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=s,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u=-s,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-a*s+o)),u=d>0?-s:Math.min(Math.max(-s,-l),s),f=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-s,-l),s),f=u*(u+2*l)+c):(d=Math.max(0,-(a*s+o)),u=d>0?s:Math.min(Math.max(-s,-l),s),f=-d*d+u*(u+2*l)+c);else u=a>0?-s:s,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),r&&r.copy(Ko).addScaledVector(Ns,u),f}intersectSphere(e,t){Bn.subVectors(e.center,this.origin);let n=Bn.dot(this.direction),r=Bn.dot(Bn)-n*n,s=e.radius*e.radius;if(r>s)return null;let a=Math.sqrt(s-r),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,r=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,r=(e.min.x-u.x)*c),h>=0?(s=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(s=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),n>a||s>r||((s>n||isNaN(n))&&(n=s),(a<r||isNaN(r))&&(r=a),d>=0?(o=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(o=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),n>l||o>r)||((o>n||n!==n)&&(n=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Bn)!==null}intersectTriangle(e,t,n,r,s){jo.subVectors(t,e),Us.subVectors(n,e),Qo.crossVectors(jo,Us);let a=this.direction.dot(Qo),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;ei.subVectors(this.origin,e);let l=o*this.direction.dot(Us.crossVectors(ei,Us));if(l<0)return null;let c=o*this.direction.dot(jo.cross(ei));if(c<0||l+c>a)return null;let h=-o*ei.dot(Qo);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ft=class i{constructor(e,t,n,r,s,a,o,l,c,h,d,u,f,g,y,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,c,h,d,u,f,g,y,m)}set(e,t,n,r,s,a,o,l,c,h,d,u,f,g,y,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=r,p[1]=s,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=g,p[11]=y,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/$i.setFromMatrixColumn(e,0).length(),s=1/$i.setFromMatrixColumn(e,1).length(),a=1/$i.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(r),c=Math.sin(r),h=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){let u=a*h,f=a*d,g=o*h,y=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=u-y*c,t[9]=-o*l,t[2]=y-u*c,t[6]=g+f*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*h,f=l*d,g=c*h,y=c*d;t[0]=u+y*o,t[4]=g*o-f,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=f*o-g,t[6]=y+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*h,f=l*d,g=c*h,y=c*d;t[0]=u-y*o,t[4]=-a*d,t[8]=g+f*o,t[1]=f+g*o,t[5]=a*h,t[9]=y-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*h,f=a*d,g=o*h,y=o*d;t[0]=l*h,t[4]=g*c-f,t[8]=u*c+y,t[1]=l*d,t[5]=y*c+u,t[9]=f*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,f=a*c,g=o*l,y=o*c;t[0]=l*h,t[4]=y-u*d,t[8]=g*d+f,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=f*d+g,t[10]=u-y*d}else if(e.order==="XZY"){let u=a*l,f=a*c,g=o*l,y=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+y,t[5]=a*h,t[9]=f*d-g,t[2]=g*d-f,t[6]=o*h,t[10]=y*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ou,e,ku)}lookAt(e,t,n){let r=this.elements;return en.subVectors(e,t),en.lengthSq()===0&&(en.z=1),en.normalize(),ti.crossVectors(n,en),ti.lengthSq()===0&&(Math.abs(n.z)===1?en.x+=1e-4:en.z+=1e-4,en.normalize(),ti.crossVectors(n,en)),ti.normalize(),Fs.crossVectors(en,ti),r[0]=ti.x,r[4]=Fs.x,r[8]=en.x,r[1]=ti.y,r[5]=Fs.y,r[9]=en.y,r[2]=ti.z,r[6]=Fs.z,r[10]=en.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],f=n[13],g=n[2],y=n[6],m=n[10],p=n[14],E=n[3],w=n[7],v=n[11],R=n[15],C=r[0],L=r[4],D=r[8],M=r[12],b=r[1],P=r[5],O=r[9],z=r[13],W=r[2],q=r[6],V=r[10],te=r[14],G=r[3],le=r[7],de=r[11],ge=r[15];return s[0]=a*C+o*b+l*W+c*G,s[4]=a*L+o*P+l*q+c*le,s[8]=a*D+o*O+l*V+c*de,s[12]=a*M+o*z+l*te+c*ge,s[1]=h*C+d*b+u*W+f*G,s[5]=h*L+d*P+u*q+f*le,s[9]=h*D+d*O+u*V+f*de,s[13]=h*M+d*z+u*te+f*ge,s[2]=g*C+y*b+m*W+p*G,s[6]=g*L+y*P+m*q+p*le,s[10]=g*D+y*O+m*V+p*de,s[14]=g*M+y*z+m*te+p*ge,s[3]=E*C+w*b+v*W+R*G,s[7]=E*L+w*P+v*q+R*le,s[11]=E*D+w*O+v*V+R*de,s[15]=E*M+w*z+v*te+R*ge,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],f=e[14],g=e[3],y=e[7],m=e[11],p=e[15];return g*(+s*l*d-r*c*d-s*o*u+n*c*u+r*o*f-n*l*f)+y*(+t*l*f-t*c*u+s*a*u-r*a*f+r*c*h-s*l*h)+m*(+t*c*d-t*o*f-s*a*d+n*a*f+s*o*h-n*c*h)+p*(-r*o*h-t*l*d+t*o*u+r*a*d-n*a*u+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],f=e[11],g=e[12],y=e[13],m=e[14],p=e[15],E=d*m*c-y*u*c+y*l*f-o*m*f-d*l*p+o*u*p,w=g*u*c-h*m*c-g*l*f+a*m*f+h*l*p-a*u*p,v=h*y*c-g*d*c+g*o*f-a*y*f-h*o*p+a*d*p,R=g*d*l-h*y*l-g*o*u+a*y*u+h*o*m-a*d*m,C=t*E+n*w+r*v+s*R;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let L=1/C;return e[0]=E*L,e[1]=(y*u*s-d*m*s-y*r*f+n*m*f+d*r*p-n*u*p)*L,e[2]=(o*m*s-y*l*s+y*r*c-n*m*c-o*r*p+n*l*p)*L,e[3]=(d*l*s-o*u*s-d*r*c+n*u*c+o*r*f-n*l*f)*L,e[4]=w*L,e[5]=(h*m*s-g*u*s+g*r*f-t*m*f-h*r*p+t*u*p)*L,e[6]=(g*l*s-a*m*s-g*r*c+t*m*c+a*r*p-t*l*p)*L,e[7]=(a*u*s-h*l*s+h*r*c-t*u*c-a*r*f+t*l*f)*L,e[8]=v*L,e[9]=(g*d*s-h*y*s-g*n*f+t*y*f+h*n*p-t*d*p)*L,e[10]=(a*y*s-g*o*s+g*n*c-t*y*c-a*n*p+t*o*p)*L,e[11]=(h*o*s-a*d*s-h*n*c+t*d*c+a*n*f-t*o*f)*L,e[12]=R*L,e[13]=(h*y*r-g*d*r+g*n*u-t*y*u-h*n*m+t*d*m)*L,e[14]=(g*o*r-a*y*r-g*n*l+t*y*l+a*n*m-t*o*m)*L,e[15]=(a*d*r-h*o*r+h*n*l-t*d*l-a*n*u+t*o*u)*L,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,h=s*o;return this.set(c*a+n,c*o-r*l,c*l+r*o,0,c*o+r*l,h*o+n,h*l-r*a,0,c*l-r*o,h*l+r*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,a){return this.set(1,n,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,h=a+a,d=o+o,u=s*c,f=s*h,g=s*d,y=a*h,m=a*d,p=o*d,E=l*c,w=l*h,v=l*d,R=n.x,C=n.y,L=n.z;return r[0]=(1-(y+p))*R,r[1]=(f+v)*R,r[2]=(g-w)*R,r[3]=0,r[4]=(f-v)*C,r[5]=(1-(u+p))*C,r[6]=(m+E)*C,r[7]=0,r[8]=(g+w)*L,r[9]=(m-E)*L,r[10]=(1-(u+y))*L,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,s=$i.set(r[0],r[1],r[2]).length(),a=$i.set(r[4],r[5],r[6]).length(),o=$i.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],yn.copy(this);let c=1/s,h=1/a,d=1/o;return yn.elements[0]*=c,yn.elements[1]*=c,yn.elements[2]*=c,yn.elements[4]*=h,yn.elements[5]*=h,yn.elements[6]*=h,yn.elements[8]*=d,yn.elements[9]*=d,yn.elements[10]*=d,t.setFromRotationMatrix(yn),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,r,s,a,o=vn,l=!1){let c=this.elements,h=2*s/(t-e),d=2*s/(n-r),u=(t+e)/(t-e),f=(n+r)/(n-r),g,y;if(l)g=s/(a-s),y=a*s/(a-s);else if(o===vn)g=-(a+s)/(a-s),y=-2*a*s/(a-s);else if(o===Wr)g=-a/(a-s),y=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,s,a,o=vn,l=!1){let c=this.elements,h=2/(t-e),d=2/(n-r),u=-(t+e)/(t-e),f=-(n+r)/(n-r),g,y;if(l)g=1/(a-s),y=a/(a-s);else if(o===vn)g=-2/(a-s),y=-(a+s)/(a-s);else if(o===Wr)g=-1/(a-s),y=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},$i=new T,yn=new ft,Ou=new T(0,0,0),ku=new T(1,1,1),ti=new T,Fs=new T,en=new T,Wc=new ft,Xc=new Dt,bn=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],h=r[9],d=r[2],u=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(Ge(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ge(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ge(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Ge(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ge(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Ge(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Wc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Wc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Xc.setFromEuler(this),this.setFromQuaternion(Xc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};bn.DEFAULT_ORDER="XYZ";var Yr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Bu=0,qc=new T,Zi=new Dt,zn=new ft,Os=new T,Ur=new T,zu=new T,Hu=new Dt,Yc=new T(1,0,0),$c=new T(0,1,0),Zc=new T(0,0,1),Jc={type:"added"},Vu={type:"removed"},Ji={type:"childadded",child:null},el={type:"childremoved",child:null},At=class i extends Rn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Bu++}),this.uuid=Ni(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new T,t=new bn,n=new Dt,r=new T(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ft},normalMatrix:{value:new ze}}),this.matrix=new ft,this.matrixWorld=new ft,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Zi.setFromAxisAngle(e,t),this.quaternion.multiply(Zi),this}rotateOnWorldAxis(e,t){return Zi.setFromAxisAngle(e,t),this.quaternion.premultiply(Zi),this}rotateX(e){return this.rotateOnAxis(Yc,e)}rotateY(e){return this.rotateOnAxis($c,e)}rotateZ(e){return this.rotateOnAxis(Zc,e)}translateOnAxis(e,t){return qc.copy(e).applyQuaternion(this.quaternion),this.position.add(qc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Yc,e)}translateY(e){return this.translateOnAxis($c,e)}translateZ(e){return this.translateOnAxis(Zc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(zn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Os.copy(e):Os.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Ur.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?zn.lookAt(Ur,Os,this.up):zn.lookAt(Os,Ur,this.up),this.quaternion.setFromRotationMatrix(zn),r&&(zn.extractRotation(r.matrixWorld),Zi.setFromRotationMatrix(zn),this.quaternion.premultiply(Zi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Jc),Ji.child=e,this.dispatchEvent(Ji),Ji.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Vu),el.child=e,this.dispatchEvent(el),el.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),zn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),zn.multiply(e.parent.matrixWorld)),e.applyMatrix4(zn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Jc),Ji.child=e,this.dispatchEvent(Ji),Ji.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ur,e,zu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ur,Hu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];s(e.shapes,d)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];r.animations.push(s(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),u=a(e.skeletons),f=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=r,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}};At.DEFAULT_UP=new T(0,1,0);At.DEFAULT_MATRIX_AUTO_UPDATE=!0;At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _n=new T,Hn=new T,tl=new T,Vn=new T,Ki=new T,ji=new T,Kc=new T,nl=new T,il=new T,rl=new T,sl=new vt,al=new vt,ol=new vt,Gn=class i{constructor(e=new T,t=new T,n=new T){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),_n.subVectors(e,t),r.cross(_n);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){_n.subVectors(r,t),Hn.subVectors(n,t),tl.subVectors(e,t);let a=_n.dot(_n),o=_n.dot(Hn),l=_n.dot(tl),c=Hn.dot(Hn),h=Hn.dot(tl),d=a*c-o*o;if(d===0)return s.set(0,0,0),null;let u=1/d,f=(c*l-o*h)*u,g=(a*h-o*l)*u;return s.set(1-f-g,g,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Vn)===null?!1:Vn.x>=0&&Vn.y>=0&&Vn.x+Vn.y<=1}static getInterpolation(e,t,n,r,s,a,o,l){return this.getBarycoord(e,t,n,r,Vn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Vn.x),l.addScaledVector(a,Vn.y),l.addScaledVector(o,Vn.z),l)}static getInterpolatedAttribute(e,t,n,r,s,a){return sl.setScalar(0),al.setScalar(0),ol.setScalar(0),sl.fromBufferAttribute(e,t),al.fromBufferAttribute(e,n),ol.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(sl,s.x),a.addScaledVector(al,s.y),a.addScaledVector(ol,s.z),a}static isFrontFacing(e,t,n,r){return _n.subVectors(n,t),Hn.subVectors(e,t),_n.cross(Hn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return _n.subVectors(this.c,this.b),Hn.subVectors(this.a,this.b),_n.cross(Hn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,a,o;Ki.subVectors(r,n),ji.subVectors(s,n),nl.subVectors(e,n);let l=Ki.dot(nl),c=ji.dot(nl);if(l<=0&&c<=0)return t.copy(n);il.subVectors(e,r);let h=Ki.dot(il),d=ji.dot(il);if(h>=0&&d<=h)return t.copy(r);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Ki,a);rl.subVectors(e,s);let f=Ki.dot(rl),g=ji.dot(rl);if(g>=0&&f<=g)return t.copy(s);let y=f*c-l*g;if(y<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(ji,o);let m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return Kc.subVectors(s,r),o=(d-h)/(d-h+(f-g)),t.copy(r).addScaledVector(Kc,o);let p=1/(m+y+u);return a=y*p,o=u*p,t.copy(n).addScaledVector(Ki,a).addScaledVector(ji,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ed={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ni={h:0,s:0,l:0},ks={h:0,s:0,l:0};function ll(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var $e=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Vt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=je.workingColorSpace){return this.r=e,this.g=t,this.b=n,je.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=je.workingColorSpace){if(e=$l(e,1),t=Ge(t,0,1),n=Ge(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=ll(a,s,e+1/3),this.g=ll(a,s,e),this.b=ll(a,s,e-1/3)}return je.colorSpaceToWorking(this,r),this}setStyle(e,t=Vt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Vt){let n=ed[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Wn(e.r),this.g=Wn(e.g),this.b=Wn(e.b),this}copyLinearToSRGB(e){return this.r=rr(e.r),this.g=rr(e.g),this.b=rr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Vt){return je.workingToColorSpace(Ot.copy(this),e),Math.round(Ge(Ot.r*255,0,255))*65536+Math.round(Ge(Ot.g*255,0,255))*256+Math.round(Ge(Ot.b*255,0,255))}getHexString(e=Vt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=je.workingColorSpace){je.workingToColorSpace(Ot.copy(this),t);let n=Ot.r,r=Ot.g,s=Ot.b,a=Math.max(n,r,s),o=Math.min(n,r,s),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case n:l=(r-s)/d+(r<s?6:0);break;case r:l=(s-n)/d+2;break;case s:l=(n-r)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=je.workingColorSpace){return je.workingToColorSpace(Ot.copy(this),t),e.r=Ot.r,e.g=Ot.g,e.b=Ot.b,e}getStyle(e=Vt){je.workingToColorSpace(Ot.copy(this),e);let t=Ot.r,n=Ot.g,r=Ot.b;return e!==Vt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(ni),this.setHSL(ni.h+e,ni.s+t,ni.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ni),e.getHSL(ks);let n=Br(ni.h,ks.h,t),r=Br(ni.s,ks.s,t),s=Br(ni.l,ks.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ot=new $e;$e.NAMES=ed;var Gu=0,Ln=class extends Rn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Gu++}),this.uuid=Ni(),this.name="",this.type="Material",this.blending=wi,this.side=Xn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ra,this.blendDst=sa,this.blendEquation=si,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new $e(0,0,0),this.blendAlpha=0,this.depthFunc=Si,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=bi,this.stencilZFail=bi,this.stencilZPass=bi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==wi&&(n.blending=this.blending),this.side!==Xn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ra&&(n.blendSrc=this.blendSrc),this.blendDst!==sa&&(n.blendDst=this.blendDst),this.blendEquation!==si&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Si&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==bl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==bi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==bi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==bi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let a=[];for(let o in s){let l=s[o];delete l.metadata,a.push(l)}return a}if(t){let s=r(e.textures),a=r(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},$r=class extends Ln{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new $e(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.combine=Ul,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var St=new T,Bs=new ce,Wu=0,nn=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Wu++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Ml,this.updateRanges=[],this.gpuType=Un,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Bs.fromBufferAttribute(this,t),Bs.applyMatrix3(e),this.setXY(t,Bs.x,Bs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix3(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix4(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyNormalMatrix(e),this.setXYZ(t,St.x,St.y,St.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.transformDirection(e),this.setXYZ(t,St.x,St.y,St.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=nr(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ht(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=nr(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=nr(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=nr(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=nr(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array),r=Ht(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array),r=Ht(r,this.array),s=Ht(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ml&&(e.usage=this.usage),e}};var Zr=class extends nn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Jr=class extends nn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var mt=class extends nn{constructor(e,t,n){super(new Float32Array(e),t,n)}},Xu=0,hn=new ft,cl=new At,Qi=new T,tn=new Yt,Fr=new Yt,It=new T,Et=class i extends Rn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Xu++}),this.uuid=Ni(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Zl(e)?Jr:Zr)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new ze().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return hn.makeRotationFromQuaternion(e),this.applyMatrix4(hn),this}rotateX(e){return hn.makeRotationX(e),this.applyMatrix4(hn),this}rotateY(e){return hn.makeRotationY(e),this.applyMatrix4(hn),this}rotateZ(e){return hn.makeRotationZ(e),this.applyMatrix4(hn),this}translate(e,t,n){return hn.makeTranslation(e,t,n),this.applyMatrix4(hn),this}scale(e,t,n){return hn.makeScale(e,t,n),this.applyMatrix4(hn),this}lookAt(e){return cl.lookAt(e),cl.updateMatrix(),this.applyMatrix4(cl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Qi).negate(),this.translate(Qi.x,Qi.y,Qi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let r=0,s=e.length;r<s;r++){let a=e[r];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new mt(n,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Yt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new T(-1/0,-1/0,-1/0),new T(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];tn.setFromBufferAttribute(s),this.morphTargetsRelative?(It.addVectors(this.boundingBox.min,tn.min),this.boundingBox.expandByPoint(It),It.addVectors(this.boundingBox.max,tn.max),this.boundingBox.expandByPoint(It)):(this.boundingBox.expandByPoint(tn.min),this.boundingBox.expandByPoint(tn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ti);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new T,1/0);return}if(e){let n=this.boundingSphere.center;if(tn.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];Fr.setFromBufferAttribute(o),this.morphTargetsRelative?(It.addVectors(tn.min,Fr.min),tn.expandByPoint(It),It.addVectors(tn.max,Fr.max),tn.expandByPoint(It)):(tn.expandByPoint(Fr.min),tn.expandByPoint(Fr.max))}tn.getCenter(n);let r=0;for(let s=0,a=e.count;s<a;s++)It.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(It));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)It.fromBufferAttribute(o,c),l&&(Qi.fromBufferAttribute(e,c),It.add(Qi)),r=Math.max(r,n.distanceToSquared(It))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new nn(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let D=0;D<n.count;D++)o[D]=new T,l[D]=new T;let c=new T,h=new T,d=new T,u=new ce,f=new ce,g=new ce,y=new T,m=new T;function p(D,M,b){c.fromBufferAttribute(n,D),h.fromBufferAttribute(n,M),d.fromBufferAttribute(n,b),u.fromBufferAttribute(s,D),f.fromBufferAttribute(s,M),g.fromBufferAttribute(s,b),h.sub(c),d.sub(c),f.sub(u),g.sub(u);let P=1/(f.x*g.y-g.x*f.y);isFinite(P)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(P),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(P),o[D].add(y),o[M].add(y),o[b].add(y),l[D].add(m),l[M].add(m),l[b].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let D=0,M=E.length;D<M;++D){let b=E[D],P=b.start,O=b.count;for(let z=P,W=P+O;z<W;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let w=new T,v=new T,R=new T,C=new T;function L(D){R.fromBufferAttribute(r,D),C.copy(R);let M=o[D];w.copy(M),w.sub(R.multiplyScalar(R.dot(M))).normalize(),v.crossVectors(C,M);let P=v.dot(l[D])<0?-1:1;a.setXYZW(D,w.x,w.y,w.z,P)}for(let D=0,M=E.length;D<M;++D){let b=E[D],P=b.start,O=b.count;for(let z=P,W=P+O;z<W;z+=3)L(e.getX(z+0)),L(e.getX(z+1)),L(e.getX(z+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new nn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);let r=new T,s=new T,a=new T,o=new T,l=new T,c=new T,h=new T,d=new T;if(e)for(let u=0,f=e.count;u<f;u+=3){let g=e.getX(u+0),y=e.getX(u+1),m=e.getX(u+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,y),a.fromBufferAttribute(t,m),h.subVectors(a,s),d.subVectors(r,s),h.cross(d),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,f=t.count;u<f;u+=3)r.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,s),d.subVectors(r,s),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)It.fromBufferAttribute(e,t),It.normalize(),e.setXYZ(t,It.x,It.y,It.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),f=0,g=0;for(let y=0,m=l.length;y<m;y++){o.isInterleavedBufferAttribute?f=l[y]*o.data.stride+o.offset:f=l[y]*h;for(let p=0;p<h;p++)u[g++]=c[f++]}return new nn(u,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let o in r){let l=r[o],c=e(l,n);t.setAttribute(o,c)}let s=this.morphAttributes;for(let o in s){let l=[],c=s[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],f=e(u,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d];h.push(f.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let c in r){let h=r[c];this.setAttribute(c,h.clone(t))}let s=e.morphAttributes;for(let c in s){let h=[],d=s[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},jc=new ft,vi=new Ai,zs=new Ti,Qc=new T,Hs=new T,Vs=new T,Gs=new T,hl=new T,Ws=new T,eh=new T,Xs=new T,Mt=class extends At{constructor(e=new Et,t=new $r){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){let o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(s&&o){Ws.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=o[l],d=s[l];h!==0&&(hl.fromBufferAttribute(d,e),a?Ws.addScaledVector(hl,h):Ws.addScaledVector(hl.sub(t),h))}t.add(Ws)}return t}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),zs.copy(n.boundingSphere),zs.applyMatrix4(s),vi.copy(e.ray).recast(e.near),!(zs.containsPoint(vi.origin)===!1&&(vi.intersectSphere(zs,Qc)===null||vi.origin.distanceToSquared(Qc)>(e.far-e.near)**2))&&(jc.copy(s).invert(),vi.copy(e.ray).applyMatrix4(jc),!(n.boundingBox!==null&&vi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,vi)))}_computeIntersections(e,t,n){let r,s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,d=s.attributes.normal,u=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,y=u.length;g<y;g++){let m=u[g],p=a[m.materialIndex],E=Math.max(m.start,f.start),w=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let v=E,R=w;v<R;v+=3){let C=o.getX(v),L=o.getX(v+1),D=o.getX(v+2);r=qs(this,p,e,n,c,h,d,C,L,D),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),y=Math.min(o.count,f.start+f.count);for(let m=g,p=y;m<p;m+=3){let E=o.getX(m),w=o.getX(m+1),v=o.getX(m+2);r=qs(this,a,e,n,c,h,d,E,w,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,y=u.length;g<y;g++){let m=u[g],p=a[m.materialIndex],E=Math.max(m.start,f.start),w=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=E,R=w;v<R;v+=3){let C=v,L=v+1,D=v+2;r=qs(this,p,e,n,c,h,d,C,L,D),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let m=g,p=y;m<p;m+=3){let E=m,w=m+1,v=m+2;r=qs(this,a,e,n,c,h,d,E,w,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};function qu(i,e,t,n,r,s,a,o){let l;if(e.side===Gt?l=n.intersectTriangle(a,s,r,!0,o):l=n.intersectTriangle(r,s,a,e.side===Xn,o),l===null)return null;Xs.copy(o),Xs.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Xs);return c<t.near||c>t.far?null:{distance:c,point:Xs.clone(),object:i}}function qs(i,e,t,n,r,s,a,o,l,c){i.getVertexPosition(o,Hs),i.getVertexPosition(l,Vs),i.getVertexPosition(c,Gs);let h=qu(i,e,t,n,Hs,Vs,Gs,eh);if(h){let d=new T;Gn.getBarycoord(eh,Hs,Vs,Gs,d),r&&(h.uv=Gn.getInterpolatedAttribute(r,o,l,c,d,new ce)),s&&(h.uv1=Gn.getInterpolatedAttribute(s,o,l,c,d,new ce)),a&&(h.normal=Gn.getInterpolatedAttribute(a,o,l,c,d,new T),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new T,materialIndex:0};Gn.getNormal(Hs,Vs,Gs,u.normal),h.face=u,h.barycoord=d}return h}var In=class i extends Et{constructor(e=1,t=1,n=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:a};let o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,f=0;g("z","y","x",-1,-1,n,t,e,a,s,0),g("z","y","x",1,-1,n,t,-e,a,s,1),g("x","z","y",1,1,e,n,t,r,a,2),g("x","z","y",1,-1,e,n,-t,r,a,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new mt(c,3)),this.setAttribute("normal",new mt(h,3)),this.setAttribute("uv",new mt(d,2));function g(y,m,p,E,w,v,R,C,L,D,M){let b=v/L,P=R/D,O=v/2,z=R/2,W=C/2,q=L+1,V=D+1,te=0,G=0,le=new T;for(let de=0;de<V;de++){let ge=de*P-z;for(let De=0;De<q;De++){let Ye=De*b-O;le[y]=Ye*E,le[m]=ge*w,le[p]=W,c.push(le.x,le.y,le.z),le[y]=0,le[m]=0,le[p]=C>0?1:-1,h.push(le.x,le.y,le.z),d.push(De/L),d.push(1-de/D),te+=1}}for(let de=0;de<D;de++)for(let ge=0;ge<L;ge++){let De=u+ge+q*de,Ye=u+ge+q*(de+1),Qe=u+(ge+1)+q*(de+1),Xe=u+(ge+1)+q*de;l.push(De,Ye,Xe),l.push(Ye,Qe,Xe),G+=6}o.addGroup(f,G,M),f+=G,u+=te}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ui(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Bt(i){let e={};for(let t=0;t<i.length;t++){let n=Ui(i[t]);for(let r in n)e[r]=n[r]}return e}function Yu(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Jl(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:je.workingColorSpace}var td={clone:Ui,merge:Bt},$u=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Zu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Mn=class extends Ln{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=$u,this.fragmentShader=Zu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ui(e.uniforms),this.uniformsGroups=Yu(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Kr=class extends At{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ft,this.projectionMatrix=new ft,this.projectionMatrixInverse=new ft,this.coordinateSystem=vn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},ii=new T,th=new ce,nh=new ce,kt=class extends Kr{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ar*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ir*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ar*2*Math.atan(Math.tan(ir*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ii.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ii.x,ii.y).multiplyScalar(-e/ii.z),ii.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ii.x,ii.y).multiplyScalar(-e/ii.z)}getViewSize(e,t){return this.getViewBounds(e,th,nh),t.subVectors(nh,th)}setViewOffset(e,t,n,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ir*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,t-=a.offsetY*n/c,r*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},er=-90,tr=1,ua=class extends At{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new kt(er,tr,e,t);r.layers=this.layers,this.add(r);let s=new kt(er,tr,e,t);s.layers=this.layers,this.add(s);let a=new kt(er,tr,e,t);a.layers=this.layers,this.add(a);let o=new kt(er,tr,e,t);o.layers=this.layers,this.add(o);let l=new kt(er,tr,e,t);l.layers=this.layers,this.add(l);let c=new kt(er,tr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,a,o,l]=t;for(let c of t)this.remove(c);if(e===vn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Wr)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,r),e.render(t,h),e.setRenderTarget(d,u,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},jr=class extends rn{constructor(e=[],t=Ii,n,r,s,a,o,l,c,h){super(e,t,n,r,s,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},pa=class extends Pn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new jr(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new In(5,5,5),s=new Mn({name:"CubemapFromEquirect",uniforms:Ui(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Gt,blending:$n});s.uniforms.tEquirect.value=t;let a=new Mt(r,s),o=t.minFilter;return t.minFilter===hi&&(t.minFilter=xn),new ua(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,r);e.setRenderTarget(s)}},pt=class extends At{constructor(){super(),this.isGroup=!0,this.type="Group"}},Ju={type:"move"},cr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new pt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new pt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new T,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new T),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new pt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new T,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new T),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),p=this._getHandJoint(c,y);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&u>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Ju)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new pt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};var Qr=class extends At{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new bn,this.environmentIntensity=1,this.environmentRotation=new bn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var dl=new T,Ku=new T,ju=new ze,dn=class{constructor(e=new T(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=dl.subVectors(n,t).cross(Ku.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(dl),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||ju.getNormalMatrix(e),r=this.coplanarPoint(dl).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},xi=new Ti,Qu=new ce(.5,.5),Ys=new T,hr=class{constructor(e=new dn,t=new dn,n=new dn,r=new dn,s=new dn,a=new dn){this.planes=[e,t,n,r,s,a]}set(e,t,n,r,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=vn,n=!1){let r=this.planes,s=e.elements,a=s[0],o=s[1],l=s[2],c=s[3],h=s[4],d=s[5],u=s[6],f=s[7],g=s[8],y=s[9],m=s[10],p=s[11],E=s[12],w=s[13],v=s[14],R=s[15];if(r[0].setComponents(c-a,f-h,p-g,R-E).normalize(),r[1].setComponents(c+a,f+h,p+g,R+E).normalize(),r[2].setComponents(c+o,f+d,p+y,R+w).normalize(),r[3].setComponents(c-o,f-d,p-y,R-w).normalize(),n)r[4].setComponents(l,u,m,v).normalize(),r[5].setComponents(c-l,f-u,p-m,R-v).normalize();else if(r[4].setComponents(c-l,f-u,p-m,R-v).normalize(),t===vn)r[5].setComponents(c+l,f+u,p+m,R+v).normalize();else if(t===Wr)r[5].setComponents(l,u,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),xi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),xi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(xi)}intersectsSprite(e){xi.center.set(0,0,0);let t=Qu.distanceTo(e.center);return xi.radius=.7071067811865476+t,xi.applyMatrix4(e.matrixWorld),this.intersectsSphere(xi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Ys.x=r.normal.x>0?e.max.x:e.min.x,Ys.y=r.normal.y>0?e.max.y:e.min.y,Ys.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ys)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var wn=class extends Ln{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new $e(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},fa=new T,ma=new T,ih=new ft,Or=new Ai,$s=new Ti,ul=new T,rh=new T,Dn=class extends At{constructor(e=new Et,t=new wn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let r=1,s=t.count;r<s;r++)fa.fromBufferAttribute(t,r-1),ma.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=fa.distanceTo(ma);e.setAttribute("lineDistance",new mt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),$s.copy(n.boundingSphere),$s.applyMatrix4(r),$s.radius+=s,e.ray.intersectsSphere($s)===!1)return;ih.copy(r).invert(),Or.copy(e.ray).applyMatrix4(ih);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){let f=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let y=f,m=g-1;y<m;y+=c){let p=h.getX(y),E=h.getX(y+1),w=Zs(this,e,Or,l,p,E,y);w&&t.push(w)}if(this.isLineLoop){let y=h.getX(g-1),m=h.getX(f),p=Zs(this,e,Or,l,y,m,g-1);p&&t.push(p)}}else{let f=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let y=f,m=g-1;y<m;y+=c){let p=Zs(this,e,Or,l,y,y+1,y);p&&t.push(p)}if(this.isLineLoop){let y=Zs(this,e,Or,l,g-1,f,g-1);y&&t.push(y)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){let o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}};function Zs(i,e,t,n,r,s,a){let o=i.geometry.attributes.position;if(fa.fromBufferAttribute(o,r),ma.fromBufferAttribute(o,s),t.distanceSqToSegment(fa,ma,ul,rh)>n)return;ul.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(ul);if(!(c<e.near||c>e.far))return{distance:c,point:rh.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var sh=new T,ah=new T,Ci=class extends Dn{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let r=0,s=t.count;r<s;r+=2)sh.fromBufferAttribute(t,r),ah.fromBufferAttribute(t,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+sh.distanceTo(ah);e.setAttribute("lineDistance",new mt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var es=class extends rn{constructor(e,t,n=di,r,s,a,o=un,l=un,c,h=sr,d=1){if(h!==sr&&h!==vr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:d};super(u,r,s,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new lr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},ts=class extends rn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var Sn=class i extends Et{constructor(e=1,t=1,n=1,r=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let h=[],d=[],u=[],f=[],g=0,y=[],m=n/2,p=0;E(),a===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(h),this.setAttribute("position",new mt(d,3)),this.setAttribute("normal",new mt(u,3)),this.setAttribute("uv",new mt(f,2));function E(){let v=new T,R=new T,C=0,L=(t-e)/n;for(let D=0;D<=s;D++){let M=[],b=D/s,P=b*(t-e)+e;for(let O=0;O<=r;O++){let z=O/r,W=z*l+o,q=Math.sin(W),V=Math.cos(W);R.x=P*q,R.y=-b*n+m,R.z=P*V,d.push(R.x,R.y,R.z),v.set(q,L,V).normalize(),u.push(v.x,v.y,v.z),f.push(z,1-b),M.push(g++)}y.push(M)}for(let D=0;D<r;D++)for(let M=0;M<s;M++){let b=y[M][D],P=y[M+1][D],O=y[M+1][D+1],z=y[M][D+1];(e>0||M!==0)&&(h.push(b,P,z),C+=3),(t>0||M!==s-1)&&(h.push(P,O,z),C+=3)}c.addGroup(p,C,0),p+=C}function w(v){let R=g,C=new ce,L=new T,D=0,M=v===!0?e:t,b=v===!0?1:-1;for(let O=1;O<=r;O++)d.push(0,m*b,0),u.push(0,b,0),f.push(.5,.5),g++;let P=g;for(let O=0;O<=r;O++){let W=O/r*l+o,q=Math.cos(W),V=Math.sin(W);L.x=M*V,L.y=m*b,L.z=M*q,d.push(L.x,L.y,L.z),u.push(0,b,0),C.x=q*.5+.5,C.y=V*.5*b+.5,f.push(C.x,C.y),g++}for(let O=0;O<r;O++){let z=R+O,W=P+O;v===!0?h.push(W,W+1,z):h.push(W+1,W,z),D+=3}c.addGroup(p,D,v===!0?1:2),p+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Js=new T,Ks=new T,pl=new T,js=new Gn,ns=class extends Et{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let r=Math.pow(10,4),s=Math.cos(ir*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},f=[];for(let g=0;g<l;g+=3){a?(c[0]=a.getX(g),c[1]=a.getX(g+1),c[2]=a.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);let{a:y,b:m,c:p}=js;if(y.fromBufferAttribute(o,c[0]),m.fromBufferAttribute(o,c[1]),p.fromBufferAttribute(o,c[2]),js.getNormal(pl),d[0]=`${Math.round(y.x*r)},${Math.round(y.y*r)},${Math.round(y.z*r)}`,d[1]=`${Math.round(m.x*r)},${Math.round(m.y*r)},${Math.round(m.z*r)}`,d[2]=`${Math.round(p.x*r)},${Math.round(p.y*r)},${Math.round(p.z*r)}`,!(d[0]===d[1]||d[1]===d[2]||d[2]===d[0]))for(let E=0;E<3;E++){let w=(E+1)%3,v=d[E],R=d[w],C=js[h[E]],L=js[h[w]],D=`${v}_${R}`,M=`${R}_${v}`;M in u&&u[M]?(pl.dot(u[M].normal)<=s&&(f.push(C.x,C.y,C.z),f.push(L.x,L.y,L.z)),u[M]=null):D in u||(u[D]={index0:c[E],index1:c[w],normal:pl.clone()})}}for(let g in u)if(u[g]){let{index0:y,index1:m}=u[g];Js.fromBufferAttribute(o,y),Ks.fromBufferAttribute(o,m),f.push(Js.x,Js.y,Js.z),f.push(Ks.x,Ks.y,Ks.z)}this.setAttribute("position",new mt(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},sn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,s=n.length,a;t?a=t:a=e*n[s-1];let o=0,l=s-1,c;for(;o<=l;)if(r=Math.floor(o+(l-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===a)return r/(s-1);let h=n[r],u=n[r+1]-h,f=(a-h)/u;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let a=this.getPoint(r),o=this.getPoint(s),l=t||(a.isVector2?new ce:new T);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new T,r=[],s=[],a=[],o=new T,l=new ft;for(let f=0;f<=e;f++){let g=f/e;r[f]=this.getTangentAt(g,new T)}s[0]=new T,a[0]=new T;let c=Number.MAX_VALUE,h=Math.abs(r[0].x),d=Math.abs(r[0].y),u=Math.abs(r[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],o),a[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(r[f-1],r[f]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Ge(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(o,g))}a[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(Ge(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(o.crossVectors(s[0],s[e]))>0&&(f=-f);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],f*g)),a[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},dr=class extends sn{constructor(e=0,t=0,n=1,r=1,s=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new ce){let n=t,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(a?s=0:s=r),this.aClockwise===!0&&!a&&(s===r?s=-r:s=s-r);let o=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*h-f*d+this.aX,c=u*d+f*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ga=class extends dr{constructor(e,t,n,r,s,a){super(e,t,n,n,r,s,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Kl(){let i=0,e=0,t=0,n=0;function r(s,a,o,l){i=s,e=o,t=-3*s+3*a-2*o-l,n=2*s-2*a+o+l}return{initCatmullRom:function(s,a,o,l,c){r(a,o,c*(o-s),c*(l-a))},initNonuniformCatmullRom:function(s,a,o,l,c,h,d){let u=(a-s)/c-(o-s)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,f*=h,r(a,o,u,f)},calc:function(s){let a=s*s,o=a*s;return i+e*s+t*a+n*o}}}var Qs=new T,fl=new Kl,ml=new Kl,gl=new Kl,ya=class extends sn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new T){let n=t,r=this.points,s=r.length,a=(s-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/s)+1)*s:l===0&&o===s-1&&(o=s-2,l=1);let c,h;this.closed||o>0?c=r[(o-1)%s]:(Qs.subVectors(r[0],r[1]).add(r[0]),c=Qs);let d=r[o%s],u=r[(o+1)%s];if(this.closed||o+2<s?h=r[(o+2)%s]:(Qs.subVectors(r[s-1],r[s-2]).add(r[s-1]),h=Qs),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(d),f),y=Math.pow(d.distanceToSquared(u),f),m=Math.pow(u.distanceToSquared(h),f);y<1e-4&&(y=1),g<1e-4&&(g=y),m<1e-4&&(m=y),fl.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,g,y,m),ml.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,g,y,m),gl.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,g,y,m)}else this.curveType==="catmullrom"&&(fl.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),ml.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),gl.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return n.set(fl.calc(l),ml.calc(l),gl.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new T().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function oh(i,e,t,n,r){let s=(n-e)*.5,a=(r-t)*.5,o=i*i,l=i*o;return(2*t-2*n+s+a)*l+(-3*t+3*n-2*s-a)*o+s*i+t}function ep(i,e){let t=1-i;return t*t*e}function tp(i,e){return 2*(1-i)*i*e}function np(i,e){return i*i*e}function zr(i,e,t,n){return ep(i,e)+tp(i,t)+np(i,n)}function ip(i,e){let t=1-i;return t*t*t*e}function rp(i,e){let t=1-i;return 3*t*t*i*e}function sp(i,e){return 3*(1-i)*i*i*e}function ap(i,e){return i*i*i*e}function Hr(i,e,t,n,r){return ip(i,e)+rp(i,t)+sp(i,n)+ap(i,r)}var is=class extends sn{constructor(e=new ce,t=new ce,n=new ce,r=new ce){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new ce){let n=t,r=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Hr(e,r.x,s.x,a.x,o.x),Hr(e,r.y,s.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},_a=class extends sn{constructor(e=new T,t=new T,n=new T,r=new T){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new T){let n=t,r=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Hr(e,r.x,s.x,a.x,o.x),Hr(e,r.y,s.y,a.y,o.y),Hr(e,r.z,s.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},rs=class extends sn{constructor(e=new ce,t=new ce){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ce){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ce){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},va=class extends sn{constructor(e=new T,t=new T){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new T){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new T){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ss=class extends sn{constructor(e=new ce,t=new ce,n=new ce){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ce){let n=t,r=this.v0,s=this.v1,a=this.v2;return n.set(zr(e,r.x,s.x,a.x),zr(e,r.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},xa=class extends sn{constructor(e=new T,t=new T,n=new T){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new T){let n=t,r=this.v0,s=this.v1,a=this.v2;return n.set(zr(e,r.x,s.x,a.x),zr(e,r.y,s.y,a.y),zr(e,r.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},as=class extends sn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ce){let n=t,r=this.points,s=(r.length-1)*e,a=Math.floor(s),o=s-a,l=r[a===0?a:a-1],c=r[a],h=r[a>r.length-2?r.length-1:a+1],d=r[a>r.length-3?r.length-1:a+2];return n.set(oh(o,l.x,c.x,h.x,d.x),oh(o,l.y,c.y,h.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new ce().fromArray(r))}return this}},wl=Object.freeze({__proto__:null,ArcCurve:ga,CatmullRomCurve3:ya,CubicBezierCurve:is,CubicBezierCurve3:_a,EllipseCurve:dr,LineCurve:rs,LineCurve3:va,QuadraticBezierCurve:ss,QuadraticBezierCurve3:xa,SplineCurve:as}),ba=class extends sn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new wl[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=n){let a=r[s]-n,o=this.curves[s],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,s=this.curves;r<s.length;r++){let a=s[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(new wl[r.type]().fromJSON(r))}return this}},os=class extends ba{constructor(e){super(),this.type="Path",this.currentPoint=new ce,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new rs(this.currentPoint.clone(),new ce(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let s=new ss(this.currentPoint.clone(),new ce(e,t),new ce(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,a){let o=new is(this.currentPoint.clone(),new ce(e,t),new ce(n,r),new ce(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new as(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,r,s,a),this}absarc(e,t,n,r,s,a){return this.absellipse(e,t,n,n,r,s,a),this}ellipse(e,t,n,r,s,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,r,s,a,o,l),this}absellipse(e,t,n,r,s,a,o,l){let c=new dr(e,t,n,r,s,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},ur=class extends os{constructor(e){super(e),this.uuid=Ni(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(new os().fromJSON(r))}return this}};function op(i,e,t=2){let n=e&&e.length,r=n?e[0]*t:i.length,s=nd(i,0,r,t,!0),a=[];if(!s||s.next===s.prev)return a;let o,l,c;if(n&&(s=up(i,e,s,t)),i.length>80*t){o=1/0,l=1/0;let h=-1/0,d=-1/0;for(let u=t;u<r;u+=t){let f=i[u],g=i[u+1];f<o&&(o=f),g<l&&(l=g),f>h&&(h=f),g>d&&(d=g)}c=Math.max(h-o,d-l),c=c!==0?32767/c:0}return ls(s,a,t,o,l,c,0),a}function nd(i,e,t,n,r){let s;if(r===wp(i,e,t,n)>0)for(let a=e;a<t;a+=n)s=lh(a/n|0,i[a],i[a+1],s);else for(let a=t-n;a>=e;a-=n)s=lh(a/n|0,i[a],i[a+1],s);return s&&pr(s,s.next)&&(hs(s),s=s.next),s}function Ri(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(pr(t,t.next)||_t(t.prev,t,t.next)===0)){if(hs(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function ls(i,e,t,n,r,s,a){if(!i)return;!a&&s&&yp(i,n,r,s);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(s?cp(i,n,r,s):lp(i)){e.push(l.i,i.i,c.i),hs(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=hp(Ri(i),e),ls(i,e,t,n,r,s,2)):a===2&&dp(i,e,t,n,r,s):ls(Ri(i),e,t,n,r,s,1);break}}}function lp(i){let e=i.prev,t=i,n=i.next;if(_t(e,t,n)>=0)return!1;let r=e.x,s=t.x,a=n.x,o=e.y,l=t.y,c=n.y,h=Math.min(r,s,a),d=Math.min(o,l,c),u=Math.max(r,s,a),f=Math.max(o,l,c),g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&kr(r,o,s,l,a,c,g.x,g.y)&&_t(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function cp(i,e,t,n){let r=i.prev,s=i,a=i.next;if(_t(r,s,a)>=0)return!1;let o=r.x,l=s.x,c=a.x,h=r.y,d=s.y,u=a.y,f=Math.min(o,l,c),g=Math.min(h,d,u),y=Math.max(o,l,c),m=Math.max(h,d,u),p=Sl(f,g,e,t,n),E=Sl(y,m,e,t,n),w=i.prevZ,v=i.nextZ;for(;w&&w.z>=p&&v&&v.z<=E;){if(w.x>=f&&w.x<=y&&w.y>=g&&w.y<=m&&w!==r&&w!==a&&kr(o,h,l,d,c,u,w.x,w.y)&&_t(w.prev,w,w.next)>=0||(w=w.prevZ,v.x>=f&&v.x<=y&&v.y>=g&&v.y<=m&&v!==r&&v!==a&&kr(o,h,l,d,c,u,v.x,v.y)&&_t(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;w&&w.z>=p;){if(w.x>=f&&w.x<=y&&w.y>=g&&w.y<=m&&w!==r&&w!==a&&kr(o,h,l,d,c,u,w.x,w.y)&&_t(w.prev,w,w.next)>=0)return!1;w=w.prevZ}for(;v&&v.z<=E;){if(v.x>=f&&v.x<=y&&v.y>=g&&v.y<=m&&v!==r&&v!==a&&kr(o,h,l,d,c,u,v.x,v.y)&&_t(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function hp(i,e){let t=i;do{let n=t.prev,r=t.next.next;!pr(n,r)&&rd(n,t,t.next,r)&&cs(n,r)&&cs(r,n)&&(e.push(n.i,t.i,r.i),hs(t),hs(t.next),t=i=r),t=t.next}while(t!==i);return Ri(t)}function dp(i,e,t,n,r,s){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&xp(a,o)){let l=sd(a,o);a=Ri(a,a.next),l=Ri(l,l.next),ls(a,e,t,n,r,s,0),ls(l,e,t,n,r,s,0);return}o=o.next}a=a.next}while(a!==i)}function up(i,e,t,n){let r=[];for(let s=0,a=e.length;s<a;s++){let o=e[s]*n,l=s<a-1?e[s+1]*n:i.length,c=nd(i,o,l,n,!1);c===c.next&&(c.steiner=!0),r.push(vp(c))}r.sort(pp);for(let s=0;s<r.length;s++)t=fp(r[s],t);return t}function pp(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),r=(e.next.y-e.y)/(e.next.x-e.x);t=n-r}return t}function fp(i,e){let t=mp(i,e);if(!t)return e;let n=sd(t,i);return Ri(n,n.next),Ri(t,t.next)}function mp(i,e){let t=e,n=i.x,r=i.y,s=-1/0,a;if(pr(i,t))return t;do{if(pr(i,t.next))return t.next;if(r<=t.y&&r>=t.next.y&&t.next.y!==t.y){let d=t.x+(r-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>s&&(s=d,a=t.x<t.next.x?t:t.next,d===n))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&id(r<c?n:s,r,l,c,r<c?s:n,r,t.x,t.y)){let d=Math.abs(r-t.y)/(n-t.x);cs(t,i)&&(d<h||d===h&&(t.x>a.x||t.x===a.x&&gp(a,t)))&&(a=t,h=d)}t=t.next}while(t!==o);return a}function gp(i,e){return _t(i.prev,i,e.prev)<0&&_t(e.next,i,i.next)<0}function yp(i,e,t,n){let r=i;do r.z===0&&(r.z=Sl(r.x,r.y,e,t,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,_p(r)}function _p(i){let e,t=1;do{let n=i,r;i=null;let s=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(r=n,n=n.nextZ,o--):(r=a,a=a.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;n=a}s.nextZ=null,t*=2}while(e>1);return i}function Sl(i,e,t,n,r){return i=(i-t)*r|0,e=(e-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function vp(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function id(i,e,t,n,r,s,a,o){return(r-a)*(e-o)>=(i-a)*(s-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(r-a)*(n-o)}function kr(i,e,t,n,r,s,a,o){return!(i===a&&e===o)&&id(i,e,t,n,r,s,a,o)}function xp(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!bp(i,e)&&(cs(i,e)&&cs(e,i)&&Mp(i,e)&&(_t(i.prev,i,e.prev)||_t(i,e.prev,e))||pr(i,e)&&_t(i.prev,i,i.next)>0&&_t(e.prev,e,e.next)>0)}function _t(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function pr(i,e){return i.x===e.x&&i.y===e.y}function rd(i,e,t,n){let r=ta(_t(i,e,t)),s=ta(_t(i,e,n)),a=ta(_t(t,n,i)),o=ta(_t(t,n,e));return!!(r!==s&&a!==o||r===0&&ea(i,t,e)||s===0&&ea(i,n,e)||a===0&&ea(t,i,n)||o===0&&ea(t,e,n))}function ea(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function ta(i){return i>0?1:i<0?-1:0}function bp(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&rd(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function cs(i,e){return _t(i.prev,i,i.next)<0?_t(i,e,i.next)>=0&&_t(i,i.prev,e)>=0:_t(i,e,i.prev)<0||_t(i,i.next,e)<0}function Mp(i,e){let t=i,n=!1,r=(i.x+e.x)/2,s=(i.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function sd(i,e){let t=El(i.i,i.x,i.y),n=El(e.i,e.x,e.y),r=i.next,s=e.prev;return i.next=e,e.prev=i,t.next=r,r.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function lh(i,e,t,n){let r=El(i,e,t);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function hs(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function El(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function wp(i,e,t,n){let r=0;for(let s=e,a=t-n;s<t;s+=n)r+=(i[a]-i[s])*(i[s+1]+i[a+1]),a=s;return r}var Tl=class{static triangulate(e,t,n=2){return op(e,t,n)}},Mi=class i{static area(e){let t=e.length,n=0;for(let r=t-1,s=0;s<t;r=s++)n+=e[r].x*e[s].y-e[s].x*e[r].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],r=[],s=[];ch(e),hh(n,e);let a=e.length;t.forEach(ch);for(let l=0;l<t.length;l++)r.push(a),a+=t[l].length,hh(n,t[l]);let o=Tl.triangulate(n,r);for(let l=0;l<o.length;l+=3)s.push(o.slice(l,l+3));return s}};function ch(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function hh(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var ds=class i extends Et{constructor(e=new ur([new ce(.5,.5),new ce(-.5,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],s=[];for(let o=0,l=e.length;o<l;o++){let c=e[o];a(c)}this.setAttribute("position",new mt(r,3)),this.setAttribute("uv",new mt(s,2)),this.computeVertexNormals();function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,u=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,E=t.UVGenerator!==void 0?t.UVGenerator:Sp,w,v=!1,R,C,L,D;p&&(w=p.getSpacedPoints(h),v=!0,u=!1,R=p.computeFrenetFrames(h,!1),C=new T,L=new T,D=new T),u||(m=0,f=0,g=0,y=0);let M=o.extractPoints(c),b=M.shape,P=M.holes;if(!Mi.isClockWise(b)){b=b.reverse();for(let Q=0,J=P.length;Q<J;Q++){let Z=P[Q];Mi.isClockWise(Z)&&(P[Q]=Z.reverse())}}function z(Q){let Z=10000000000000001e-36,$=Q[0];for(let ue=1;ue<=Q.length;ue++){let ie=ue%Q.length,pe=Q[ie],ke=pe.x-$.x,Oe=pe.y-$.y,S=ke*ke+Oe*Oe,_=Math.max(Math.abs(pe.x),Math.abs(pe.y),Math.abs($.x),Math.abs($.y)),F=Z*_*_;if(S<=F){Q.splice(ie,1),ue--;continue}$=pe}}z(b),P.forEach(z);let W=P.length,q=b;for(let Q=0;Q<W;Q++){let J=P[Q];b=b.concat(J)}function V(Q,J,Z){return J||console.error("THREE.ExtrudeGeometry: vec does not exist"),Q.clone().addScaledVector(J,Z)}let te=b.length;function G(Q,J,Z){let $,ue,ie,pe=Q.x-J.x,ke=Q.y-J.y,Oe=Z.x-Q.x,S=Z.y-Q.y,_=pe*pe+ke*ke,F=pe*S-ke*Oe;if(Math.abs(F)>Number.EPSILON){let H=Math.sqrt(_),j=Math.sqrt(Oe*Oe+S*S),X=J.x-ke/H,Ce=J.y+pe/H,he=Z.x-S/j,Ee=Z.y+Oe/j,Te=((he-X)*S-(Ee-Ce)*Oe)/(pe*S-ke*Oe);$=X+pe*Te-Q.x,ue=Ce+ke*Te-Q.y;let re=$*$+ue*ue;if(re<=2)return new ce($,ue);ie=Math.sqrt(re/2)}else{let H=!1;pe>Number.EPSILON?Oe>Number.EPSILON&&(H=!0):pe<-Number.EPSILON?Oe<-Number.EPSILON&&(H=!0):Math.sign(ke)===Math.sign(S)&&(H=!0),H?($=-ke,ue=pe,ie=Math.sqrt(_)):($=pe,ue=ke,ie=Math.sqrt(_/2))}return new ce($/ie,ue/ie)}let le=[];for(let Q=0,J=q.length,Z=J-1,$=Q+1;Q<J;Q++,Z++,$++)Z===J&&(Z=0),$===J&&($=0),le[Q]=G(q[Q],q[Z],q[$]);let de=[],ge,De=le.concat();for(let Q=0,J=W;Q<J;Q++){let Z=P[Q];ge=[];for(let $=0,ue=Z.length,ie=ue-1,pe=$+1;$<ue;$++,ie++,pe++)ie===ue&&(ie=0),pe===ue&&(pe=0),ge[$]=G(Z[$],Z[ie],Z[pe]);de.push(ge),De=De.concat(ge)}let Ye;if(m===0)Ye=Mi.triangulateShape(q,P);else{let Q=[],J=[];for(let Z=0;Z<m;Z++){let $=Z/m,ue=f*Math.cos($*Math.PI/2),ie=g*Math.sin($*Math.PI/2)+y;for(let pe=0,ke=q.length;pe<ke;pe++){let Oe=V(q[pe],le[pe],ie);Pe(Oe.x,Oe.y,-ue),$===0&&Q.push(Oe)}for(let pe=0,ke=W;pe<ke;pe++){let Oe=P[pe];ge=de[pe];let S=[];for(let _=0,F=Oe.length;_<F;_++){let H=V(Oe[_],ge[_],ie);Pe(H.x,H.y,-ue),$===0&&S.push(H)}$===0&&J.push(S)}}Ye=Mi.triangulateShape(Q,J)}let Qe=Ye.length,Xe=g+y;for(let Q=0;Q<te;Q++){let J=u?V(b[Q],De[Q],Xe):b[Q];v?(L.copy(R.normals[0]).multiplyScalar(J.x),C.copy(R.binormals[0]).multiplyScalar(J.y),D.copy(w[0]).add(L).add(C),Pe(D.x,D.y,D.z)):Pe(J.x,J.y,0)}for(let Q=1;Q<=h;Q++)for(let J=0;J<te;J++){let Z=u?V(b[J],De[J],Xe):b[J];v?(L.copy(R.normals[Q]).multiplyScalar(Z.x),C.copy(R.binormals[Q]).multiplyScalar(Z.y),D.copy(w[Q]).add(L).add(C),Pe(D.x,D.y,D.z)):Pe(Z.x,Z.y,d/h*Q)}for(let Q=m-1;Q>=0;Q--){let J=Q/m,Z=f*Math.cos(J*Math.PI/2),$=g*Math.sin(J*Math.PI/2)+y;for(let ue=0,ie=q.length;ue<ie;ue++){let pe=V(q[ue],le[ue],$);Pe(pe.x,pe.y,d+Z)}for(let ue=0,ie=P.length;ue<ie;ue++){let pe=P[ue];ge=de[ue];for(let ke=0,Oe=pe.length;ke<Oe;ke++){let S=V(pe[ke],ge[ke],$);v?Pe(S.x,S.y+w[h-1].y,w[h-1].x+Z):Pe(S.x,S.y,d+Z)}}}Y(),ee();function Y(){let Q=r.length/3;if(u){let J=0,Z=te*J;for(let $=0;$<Qe;$++){let ue=Ye[$];Se(ue[2]+Z,ue[1]+Z,ue[0]+Z)}J=h+m*2,Z=te*J;for(let $=0;$<Qe;$++){let ue=Ye[$];Se(ue[0]+Z,ue[1]+Z,ue[2]+Z)}}else{for(let J=0;J<Qe;J++){let Z=Ye[J];Se(Z[2],Z[1],Z[0])}for(let J=0;J<Qe;J++){let Z=Ye[J];Se(Z[0]+te*h,Z[1]+te*h,Z[2]+te*h)}}n.addGroup(Q,r.length/3-Q,0)}function ee(){let Q=r.length/3,J=0;be(q,J),J+=q.length;for(let Z=0,$=P.length;Z<$;Z++){let ue=P[Z];be(ue,J),J+=ue.length}n.addGroup(Q,r.length/3-Q,1)}function be(Q,J){let Z=Q.length;for(;--Z>=0;){let $=Z,ue=Z-1;ue<0&&(ue=Q.length-1);for(let ie=0,pe=h+m*2;ie<pe;ie++){let ke=te*ie,Oe=te*(ie+1),S=J+$+ke,_=J+ue+ke,F=J+ue+Oe,H=J+$+Oe;Ze(S,_,F,H)}}}function Pe(Q,J,Z){l.push(Q),l.push(J),l.push(Z)}function Se(Q,J,Z){lt(Q),lt(J),lt(Z);let $=r.length/3,ue=E.generateTopUV(n,r,$-3,$-2,$-1);A(ue[0]),A(ue[1]),A(ue[2])}function Ze(Q,J,Z,$){lt(Q),lt(J),lt($),lt(J),lt(Z),lt($);let ue=r.length/3,ie=E.generateSideWallUV(n,r,ue-6,ue-3,ue-2,ue-1);A(ie[0]),A(ie[1]),A(ie[3]),A(ie[1]),A(ie[2]),A(ie[3])}function lt(Q){r.push(l[Q*3+0]),r.push(l[Q*3+1]),r.push(l[Q*3+2])}function A(Q){s.push(Q.x),s.push(Q.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Ep(t,n,e)}static fromJSON(e,t){let n=[];for(let s=0,a=e.shapes.length;s<a;s++){let o=t[e.shapes[s]];n.push(o)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new wl[r.type]().fromJSON(r)),new i(n,e.options)}},Sp={generateTopUV:function(i,e,t,n,r){let s=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[r*3],h=e[r*3+1];return[new ce(s,a),new ce(o,l),new ce(c,h)]},generateSideWallUV:function(i,e,t,n,r,s){let a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],d=e[n*3+2],u=e[r*3],f=e[r*3+1],g=e[r*3+2],y=e[s*3],m=e[s*3+1],p=e[s*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new ce(a,1-l),new ce(c,1-d),new ce(u,1-g),new ce(y,1-p)]:[new ce(o,1-l),new ce(h,1-d),new ce(f,1-g),new ce(m,1-p)]}};function Ep(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){let s=i[n];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Pi=class i extends Et{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(r),c=o+1,h=l+1,d=e/o,u=t/l,f=[],g=[],y=[],m=[];for(let p=0;p<h;p++){let E=p*u-a;for(let w=0;w<c;w++){let v=w*d-s;g.push(v,-E,0),y.push(0,0,1),m.push(w/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let E=0;E<o;E++){let w=E+c*p,v=E+c*(p+1),R=E+1+c*(p+1),C=E+1+c*p;f.push(w,v,C),f.push(v,R,C)}this.setIndex(f),this.setAttribute("position",new mt(g,3)),this.setAttribute("normal",new mt(y,3)),this.setAttribute("uv",new mt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},qn=class i extends Et{constructor(e=.5,t=1,n=32,r=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:s,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],l=[],c=[],h=[],d=e,u=(t-e)/r,f=new T,g=new ce;for(let y=0;y<=r;y++){for(let m=0;m<=n;m++){let p=s+m/n*a;f.x=d*Math.cos(p),f.y=d*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}d+=u}for(let y=0;y<r;y++){let m=y*(n+1);for(let p=0;p<n;p++){let E=p+m,w=E,v=E+n+1,R=E+n+2,C=E+1;o.push(w,v,C),o.push(v,R,C)}}this.setIndex(o),this.setAttribute("position",new mt(l,3)),this.setAttribute("normal",new mt(c,3)),this.setAttribute("uv",new mt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var En=class i extends Et{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new T,u=new T,f=[],g=[],y=[],m=[];for(let p=0;p<=n;p++){let E=[],w=p/n,v=0;p===0&&a===0?v=.5/t:p===n&&l===Math.PI&&(v=-.5/t);for(let R=0;R<=t;R++){let C=R/t;d.x=-e*Math.cos(r+C*s)*Math.sin(a+w*o),d.y=e*Math.cos(a+w*o),d.z=e*Math.sin(r+C*s)*Math.sin(a+w*o),g.push(d.x,d.y,d.z),u.copy(d).normalize(),y.push(u.x,u.y,u.z),m.push(C+v,1-w),E.push(c++)}h.push(E)}for(let p=0;p<n;p++)for(let E=0;E<t;E++){let w=h[p][E+1],v=h[p][E],R=h[p+1][E],C=h[p+1][E+1];(p!==0||a>0)&&f.push(w,v,C),(p!==n-1||l<Math.PI)&&f.push(v,R,C)}this.setIndex(f),this.setAttribute("position",new mt(g,3)),this.setAttribute("normal",new mt(y,3)),this.setAttribute("uv",new mt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var us=class extends Ln{constructor(e){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new $e(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}};var Yn=class extends Ln{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new $e(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new $e(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xl,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Ma=class extends Ln{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Vh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},wa=class extends Ln{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function na(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Tp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Li=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let a;t:{i:if(!(e<r)){for(let o=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=r,r=t[++n],e<r)break e}a=t.length;break t}if(!(e>=s)){let o=t[1];e<o&&(n=2,s=o);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let a=0;a!==r;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Sa=class extends Li{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:_l,endingEnd:_l}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,a=e+1,o=r[s],l=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case vl:s=e,o=2*t-n;break;case xl:s=r.length-2,o=t+r[s]-r[s+1];break;default:s=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case vl:a=e,l=2*n-t;break;case xl:a=1,l=n+r[1]-r[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(n-t)/(r-t),y=g*g,m=y*g,p=-u*m+2*u*y-u*g,E=(1+u)*m+(-1.5-2*u)*y+(-.5+u)*g+1,w=(-1-f)*m+(1.5+f)*y+.5*g,v=f*m-f*y;for(let R=0;R!==o;++R)s[R]=p*a[h+R]+E*a[c+R]+w*a[l+R]+v*a[d+R];return s}},Ea=class extends Li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(r-t),d=1-h;for(let u=0;u!==o;++u)s[u]=a[c+u]*d+a[l+u]*h;return s}},Ta=class extends Li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},an=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=na(t,this.TimeBufferType),this.values=na(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:na(e.times,Array),values:na(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ta(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ea(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Sa(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Vr:t=this.InterpolantFactoryMethodDiscrete;break;case la:t=this.InterpolantFactoryMethodLinear;break;case ia:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Vr;case this.InterpolantFactoryMethodLinear:return la;case this.InterpolantFactoryMethodSmooth:return ia}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,s=0,a=r-1;for(;s!==r&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==r){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(r!==void 0&&Tp(r))for(let o=0,l=r.length;o!==l;++o){let c=r[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===ia,s=e.length-1,a=1;for(let o=1;o<s;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(r)l=!0;else{let d=o*n,u=d-n,f=d+n;for(let g=0;g!==n;++g){let y=t[d+g];if(y!==t[u+g]||y!==t[f+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let d=o*n,u=a*n;for(let f=0;f!==n;++f)t[u+f]=t[d+f]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};an.prototype.ValueTypeName="";an.prototype.TimeBufferType=Float32Array;an.prototype.ValueBufferType=Float32Array;an.prototype.DefaultInterpolation=la;var ai=class extends an{constructor(e,t,n){super(e,t,n)}};ai.prototype.ValueTypeName="bool";ai.prototype.ValueBufferType=Array;ai.prototype.DefaultInterpolation=Vr;ai.prototype.InterpolantFactoryMethodLinear=void 0;ai.prototype.InterpolantFactoryMethodSmooth=void 0;var Aa=class extends an{constructor(e,t,n,r){super(e,t,n,r)}};Aa.prototype.ValueTypeName="color";var Ca=class extends an{constructor(e,t,n,r){super(e,t,n,r)}};Ca.prototype.ValueTypeName="number";var Ra=class extends Li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(r-t),c=e*o;for(let h=c+o;c!==h;c+=4)Dt.slerpFlat(s,0,a,c-o,a,c,l);return s}},ps=class extends an{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Ra(this.times,this.values,this.getValueSize(),e)}};ps.prototype.ValueTypeName="quaternion";ps.prototype.InterpolantFactoryMethodSmooth=void 0;var oi=class extends an{constructor(e,t,n){super(e,t,n)}};oi.prototype.ValueTypeName="string";oi.prototype.ValueBufferType=Array;oi.prototype.DefaultInterpolation=Vr;oi.prototype.InterpolantFactoryMethodLinear=void 0;oi.prototype.InterpolantFactoryMethodSmooth=void 0;var Pa=class extends an{constructor(e,t,n,r){super(e,t,n,r)}};Pa.prototype.ValueTypeName="vector";var La=class{constructor(e,t,n){let r=this,s=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){o++,s===!1&&r.onStart!==void 0&&r.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,r.onProgress!==void 0&&r.onProgress(h,a,o),a===o&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},ad=new La,Ia=class{constructor(e){this.manager=e!==void 0?e:ad,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Ia.DEFAULT_MATERIAL_NAME="__DEFAULT";var fs=class extends At{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new $e(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},ms=class extends fs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.groundColor=new $e(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},yl=new ft,dh=new T,uh=new T,Al=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ce(512,512),this.mapType=Tn,this.map=null,this.mapPass=null,this.matrix=new ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new hr,this._frameExtents=new ce(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;dh.setFromMatrixPosition(e.matrixWorld),t.position.copy(dh),uh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(uh),t.updateMatrixWorld(),yl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(yl,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(yl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var gs=class extends Kr{constructor(e=-1,t=1,n=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,a=n+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Cl=class extends Al{constructor(){super(new gs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},fr=class extends fs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.shadow=new Cl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Da=class extends kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var jl="\\[\\]\\.:\\/",Ap=new RegExp("["+jl+"]","g"),Ql="[^"+jl+"]",Cp="[^"+jl.replace("\\.","")+"]",Rp=/((?:WC+[\/:])*)/.source.replace("WC",Ql),Pp=/(WCOD+)?/.source.replace("WCOD",Cp),Lp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ql),Ip=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ql),Dp=new RegExp("^"+Rp+Pp+Lp+Ip+"$"),Np=["material","materials","bones","map"],Rl=class{constructor(e,t,n){let r=n||ut.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ut=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Ap,"")}static parseTrackName(e){let t=Dp.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);Np.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[r];if(a===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ut.Composite=Rl;ut.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ut.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ut.prototype.GetterByBindingType=[ut.prototype._getValue_direct,ut.prototype._getValue_array,ut.prototype._getValue_arrayElement,ut.prototype._getValue_toArray];ut.prototype.SetterByBindingTypeAndVersioning=[[ut.prototype._setValue_direct,ut.prototype._setValue_direct_setNeedsUpdate,ut.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_array,ut.prototype._setValue_array_setNeedsUpdate,ut.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_arrayElement,ut.prototype._setValue_arrayElement_setNeedsUpdate,ut.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_fromArray,ut.prototype._setValue_fromArray_setNeedsUpdate,ut.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var s_=new Float32Array(1);var mr=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Ge(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Ge(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var ys=class extends Rn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function ec(i,e,t,n){let r=Up(n);switch(t){case Hl:return i*e;case Gl:return i*e/r.components*r.byteLength;case Za:return i*e/r.components*r.byteLength;case Wl:return i*e*2/r.components*r.byteLength;case Ja:return i*e*2/r.components*r.byteLength;case Vl:return i*e*3/r.components*r.byteLength;case pn:return i*e*4/r.components*r.byteLength;case Ka:return i*e*4/r.components*r.byteLength;case xs:case bs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ms:case ws:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Qa:case to:return Math.max(i,16)*Math.max(e,8)/4;case ja:case eo:return Math.max(i,8)*Math.max(e,8)/2;case no:case io:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ro:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case so:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ao:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case oo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case lo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case co:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ho:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case uo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case po:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case fo:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case mo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case go:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case yo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case _o:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case vo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case xo:case bo:case Mo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case wo:case So:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Eo:case To:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Up(i){switch(i){case Tn:case Ol:return{byteLength:1,components:1};case gr:case kl:case yr:return{byteLength:2,components:1};case Ya:case $a:return{byteLength:2,components:4};case di:case qa:case Un:return{byteLength:4,components:1};case Bl:case zl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function Pd(){let i=null,e=!1,t=null,n=null;function r(s,a){t(s,a),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Op(i){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let h=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){let g=d[u],y=d[f];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++u,d[u]=y)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){let y=d[f];i.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:r,remove:s,update:a}}var kp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Bp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,zp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Hp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Vp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Gp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Wp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Xp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,qp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Yp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,$p=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Zp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Jp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Kp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,jp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Qp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,ef=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,tf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,nf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,rf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,sf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,af=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,of=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,lf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,hf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,df=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,uf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,pf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ff=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,mf="gl_FragColor = linearToOutputTexel( gl_FragColor );",gf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,yf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,_f=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,vf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,xf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,bf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Mf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,wf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Sf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ef=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Tf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Af=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Cf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Rf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Pf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Lf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,If=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Df=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Nf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Uf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ff=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Of=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,kf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Bf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,zf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Hf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Vf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Wf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Xf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,qf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Yf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,$f=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Zf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Jf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Kf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,jf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Qf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,em=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,tm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,nm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,im=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,rm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,sm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,am=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,om=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,lm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,cm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,hm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,dm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,um=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,pm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,fm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,mm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,gm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ym=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,_m=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,vm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,xm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,bm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Mm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,wm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Sm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Em=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Tm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Am=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Cm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Rm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Pm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Lm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Im=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Dm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Nm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Um=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Fm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Om=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,km=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Bm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Hm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Xm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,qm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ym=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,$m=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Zm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Jm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Km=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,jm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Qm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,e0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,t0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,n0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,i0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,r0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,s0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,a0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,o0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,l0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,c0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,h0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,d0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,u0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,p0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,f0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,m0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,g0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,y0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,We={alphahash_fragment:kp,alphahash_pars_fragment:Bp,alphamap_fragment:zp,alphamap_pars_fragment:Hp,alphatest_fragment:Vp,alphatest_pars_fragment:Gp,aomap_fragment:Wp,aomap_pars_fragment:Xp,batching_pars_vertex:qp,batching_vertex:Yp,begin_vertex:$p,beginnormal_vertex:Zp,bsdfs:Jp,iridescence_fragment:Kp,bumpmap_pars_fragment:jp,clipping_planes_fragment:Qp,clipping_planes_pars_fragment:ef,clipping_planes_pars_vertex:tf,clipping_planes_vertex:nf,color_fragment:rf,color_pars_fragment:sf,color_pars_vertex:af,color_vertex:of,common:lf,cube_uv_reflection_fragment:cf,defaultnormal_vertex:hf,displacementmap_pars_vertex:df,displacementmap_vertex:uf,emissivemap_fragment:pf,emissivemap_pars_fragment:ff,colorspace_fragment:mf,colorspace_pars_fragment:gf,envmap_fragment:yf,envmap_common_pars_fragment:_f,envmap_pars_fragment:vf,envmap_pars_vertex:xf,envmap_physical_pars_fragment:Lf,envmap_vertex:bf,fog_vertex:Mf,fog_pars_vertex:wf,fog_fragment:Sf,fog_pars_fragment:Ef,gradientmap_pars_fragment:Tf,lightmap_pars_fragment:Af,lights_lambert_fragment:Cf,lights_lambert_pars_fragment:Rf,lights_pars_begin:Pf,lights_toon_fragment:If,lights_toon_pars_fragment:Df,lights_phong_fragment:Nf,lights_phong_pars_fragment:Uf,lights_physical_fragment:Ff,lights_physical_pars_fragment:Of,lights_fragment_begin:kf,lights_fragment_maps:Bf,lights_fragment_end:zf,logdepthbuf_fragment:Hf,logdepthbuf_pars_fragment:Vf,logdepthbuf_pars_vertex:Gf,logdepthbuf_vertex:Wf,map_fragment:Xf,map_pars_fragment:qf,map_particle_fragment:Yf,map_particle_pars_fragment:$f,metalnessmap_fragment:Zf,metalnessmap_pars_fragment:Jf,morphinstance_vertex:Kf,morphcolor_vertex:jf,morphnormal_vertex:Qf,morphtarget_pars_vertex:em,morphtarget_vertex:tm,normal_fragment_begin:nm,normal_fragment_maps:im,normal_pars_fragment:rm,normal_pars_vertex:sm,normal_vertex:am,normalmap_pars_fragment:om,clearcoat_normal_fragment_begin:lm,clearcoat_normal_fragment_maps:cm,clearcoat_pars_fragment:hm,iridescence_pars_fragment:dm,opaque_fragment:um,packing:pm,premultiplied_alpha_fragment:fm,project_vertex:mm,dithering_fragment:gm,dithering_pars_fragment:ym,roughnessmap_fragment:_m,roughnessmap_pars_fragment:vm,shadowmap_pars_fragment:xm,shadowmap_pars_vertex:bm,shadowmap_vertex:Mm,shadowmask_pars_fragment:wm,skinbase_vertex:Sm,skinning_pars_vertex:Em,skinning_vertex:Tm,skinnormal_vertex:Am,specularmap_fragment:Cm,specularmap_pars_fragment:Rm,tonemapping_fragment:Pm,tonemapping_pars_fragment:Lm,transmission_fragment:Im,transmission_pars_fragment:Dm,uv_pars_fragment:Nm,uv_pars_vertex:Um,uv_vertex:Fm,worldpos_vertex:Om,background_vert:km,background_frag:Bm,backgroundCube_vert:zm,backgroundCube_frag:Hm,cube_vert:Vm,cube_frag:Gm,depth_vert:Wm,depth_frag:Xm,distanceRGBA_vert:qm,distanceRGBA_frag:Ym,equirect_vert:$m,equirect_frag:Zm,linedashed_vert:Jm,linedashed_frag:Km,meshbasic_vert:jm,meshbasic_frag:Qm,meshlambert_vert:e0,meshlambert_frag:t0,meshmatcap_vert:n0,meshmatcap_frag:i0,meshnormal_vert:r0,meshnormal_frag:s0,meshphong_vert:a0,meshphong_frag:o0,meshphysical_vert:l0,meshphysical_frag:c0,meshtoon_vert:h0,meshtoon_frag:d0,points_vert:u0,points_frag:p0,shadow_vert:f0,shadow_frag:m0,sprite_vert:g0,sprite_frag:y0},me={common:{diffuse:{value:new $e(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new ce(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new $e(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new $e(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new $e(16777215)},opacity:{value:1},center:{value:new ce(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},Fn={basic:{uniforms:Bt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:We.meshbasic_vert,fragmentShader:We.meshbasic_frag},lambert:{uniforms:Bt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new $e(0)}}]),vertexShader:We.meshlambert_vert,fragmentShader:We.meshlambert_frag},phong:{uniforms:Bt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new $e(0)},specular:{value:new $e(1118481)},shininess:{value:30}}]),vertexShader:We.meshphong_vert,fragmentShader:We.meshphong_frag},standard:{uniforms:Bt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new $e(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag},toon:{uniforms:Bt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new $e(0)}}]),vertexShader:We.meshtoon_vert,fragmentShader:We.meshtoon_frag},matcap:{uniforms:Bt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:We.meshmatcap_vert,fragmentShader:We.meshmatcap_frag},points:{uniforms:Bt([me.points,me.fog]),vertexShader:We.points_vert,fragmentShader:We.points_frag},dashed:{uniforms:Bt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:We.linedashed_vert,fragmentShader:We.linedashed_frag},depth:{uniforms:Bt([me.common,me.displacementmap]),vertexShader:We.depth_vert,fragmentShader:We.depth_frag},normal:{uniforms:Bt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:We.meshnormal_vert,fragmentShader:We.meshnormal_frag},sprite:{uniforms:Bt([me.sprite,me.fog]),vertexShader:We.sprite_vert,fragmentShader:We.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:We.background_vert,fragmentShader:We.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:We.backgroundCube_vert,fragmentShader:We.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:We.cube_vert,fragmentShader:We.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:We.equirect_vert,fragmentShader:We.equirect_frag},distanceRGBA:{uniforms:Bt([me.common,me.displacementmap,{referencePosition:{value:new T},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:We.distanceRGBA_vert,fragmentShader:We.distanceRGBA_frag},shadow:{uniforms:Bt([me.lights,me.fog,{color:{value:new $e(0)},opacity:{value:1}}]),vertexShader:We.shadow_vert,fragmentShader:We.shadow_frag}};Fn.physical={uniforms:Bt([Fn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new ce(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new $e(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new ce},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new $e(0)},specularColor:{value:new $e(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new ce},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag};var Ao={r:0,b:0,g:0},Fi=new bn,_0=new ft;function v0(i,e,t,n,r,s,a){let o=new $e(0),l=s===!0?0:1,c,h,d=null,u=0,f=null;function g(w){let v=w.isScene===!0?w.background:null;return v&&v.isTexture&&(v=(w.backgroundBlurriness>0?t:e).get(v)),v}function y(w){let v=!1,R=g(w);R===null?p(o,l):R&&R.isColor&&(p(R,1),v=!0);let C=i.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,a):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(w,v){let R=g(v);R&&(R.isCubeTexture||R.mapping===_s)?(h===void 0&&(h=new Mt(new In(1,1,1),new Mn({name:"BackgroundCubeMaterial",uniforms:Ui(Fn.backgroundCube.uniforms),vertexShader:Fn.backgroundCube.vertexShader,fragmentShader:Fn.backgroundCube.fragmentShader,side:Gt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,L,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),Fi.copy(v.backgroundRotation),Fi.x*=-1,Fi.y*=-1,Fi.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(Fi.y*=-1,Fi.z*=-1),h.material.uniforms.envMap.value=R,h.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(_0.makeRotationFromEuler(Fi)),h.material.toneMapped=je.getTransfer(R.colorSpace)!==it,(d!==R||u!==R.version||f!==i.toneMapping)&&(h.material.needsUpdate=!0,d=R,u=R.version,f=i.toneMapping),h.layers.enableAll(),w.unshift(h,h.geometry,h.material,0,0,null)):R&&R.isTexture&&(c===void 0&&(c=new Mt(new Pi(2,2),new Mn({name:"BackgroundMaterial",uniforms:Ui(Fn.background.uniforms),vertexShader:Fn.background.vertexShader,fragmentShader:Fn.background.fragmentShader,side:Xn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=R,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=je.getTransfer(R.colorSpace)!==it,R.matrixAutoUpdate===!0&&R.updateMatrix(),c.material.uniforms.uvTransform.value.copy(R.matrix),(d!==R||u!==R.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,d=R,u=R.version,f=i.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null))}function p(w,v){w.getRGB(Ao,Jl(i)),n.buffers.color.setClear(Ao.r,Ao.g,Ao.b,v,a)}function E(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(w,v=1){o.set(w),l=v,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(w){l=w,p(o,l)},render:y,addToRenderList:m,dispose:E}}function x0(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=u(null),s=r,a=!1;function o(b,P,O,z,W){let q=!1,V=d(z,O,P);s!==V&&(s=V,c(s.object)),q=f(b,z,O,W),q&&g(b,z,O,W),W!==null&&e.update(W,i.ELEMENT_ARRAY_BUFFER),(q||a)&&(a=!1,v(b,P,O,z),W!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(W).buffer))}function l(){return i.createVertexArray()}function c(b){return i.bindVertexArray(b)}function h(b){return i.deleteVertexArray(b)}function d(b,P,O){let z=O.wireframe===!0,W=n[b.id];W===void 0&&(W={},n[b.id]=W);let q=W[P.id];q===void 0&&(q={},W[P.id]=q);let V=q[z];return V===void 0&&(V=u(l()),q[z]=V),V}function u(b){let P=[],O=[],z=[];for(let W=0;W<t;W++)P[W]=0,O[W]=0,z[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:O,attributeDivisors:z,object:b,attributes:{},index:null}}function f(b,P,O,z){let W=s.attributes,q=P.attributes,V=0,te=O.getAttributes();for(let G in te)if(te[G].location>=0){let de=W[G],ge=q[G];if(ge===void 0&&(G==="instanceMatrix"&&b.instanceMatrix&&(ge=b.instanceMatrix),G==="instanceColor"&&b.instanceColor&&(ge=b.instanceColor)),de===void 0||de.attribute!==ge||ge&&de.data!==ge.data)return!0;V++}return s.attributesNum!==V||s.index!==z}function g(b,P,O,z){let W={},q=P.attributes,V=0,te=O.getAttributes();for(let G in te)if(te[G].location>=0){let de=q[G];de===void 0&&(G==="instanceMatrix"&&b.instanceMatrix&&(de=b.instanceMatrix),G==="instanceColor"&&b.instanceColor&&(de=b.instanceColor));let ge={};ge.attribute=de,de&&de.data&&(ge.data=de.data),W[G]=ge,V++}s.attributes=W,s.attributesNum=V,s.index=z}function y(){let b=s.newAttributes;for(let P=0,O=b.length;P<O;P++)b[P]=0}function m(b){p(b,0)}function p(b,P){let O=s.newAttributes,z=s.enabledAttributes,W=s.attributeDivisors;O[b]=1,z[b]===0&&(i.enableVertexAttribArray(b),z[b]=1),W[b]!==P&&(i.vertexAttribDivisor(b,P),W[b]=P)}function E(){let b=s.newAttributes,P=s.enabledAttributes;for(let O=0,z=P.length;O<z;O++)P[O]!==b[O]&&(i.disableVertexAttribArray(O),P[O]=0)}function w(b,P,O,z,W,q,V){V===!0?i.vertexAttribIPointer(b,P,O,W,q):i.vertexAttribPointer(b,P,O,z,W,q)}function v(b,P,O,z){y();let W=z.attributes,q=O.getAttributes(),V=P.defaultAttributeValues;for(let te in q){let G=q[te];if(G.location>=0){let le=W[te];if(le===void 0&&(te==="instanceMatrix"&&b.instanceMatrix&&(le=b.instanceMatrix),te==="instanceColor"&&b.instanceColor&&(le=b.instanceColor)),le!==void 0){let de=le.normalized,ge=le.itemSize,De=e.get(le);if(De===void 0)continue;let Ye=De.buffer,Qe=De.type,Xe=De.bytesPerElement,Y=Qe===i.INT||Qe===i.UNSIGNED_INT||le.gpuType===qa;if(le.isInterleavedBufferAttribute){let ee=le.data,be=ee.stride,Pe=le.offset;if(ee.isInstancedInterleavedBuffer){for(let Se=0;Se<G.locationSize;Se++)p(G.location+Se,ee.meshPerAttribute);b.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Se=0;Se<G.locationSize;Se++)m(G.location+Se);i.bindBuffer(i.ARRAY_BUFFER,Ye);for(let Se=0;Se<G.locationSize;Se++)w(G.location+Se,ge/G.locationSize,Qe,de,be*Xe,(Pe+ge/G.locationSize*Se)*Xe,Y)}else{if(le.isInstancedBufferAttribute){for(let ee=0;ee<G.locationSize;ee++)p(G.location+ee,le.meshPerAttribute);b.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let ee=0;ee<G.locationSize;ee++)m(G.location+ee);i.bindBuffer(i.ARRAY_BUFFER,Ye);for(let ee=0;ee<G.locationSize;ee++)w(G.location+ee,ge/G.locationSize,Qe,de,ge*Xe,ge/G.locationSize*ee*Xe,Y)}}else if(V!==void 0){let de=V[te];if(de!==void 0)switch(de.length){case 2:i.vertexAttrib2fv(G.location,de);break;case 3:i.vertexAttrib3fv(G.location,de);break;case 4:i.vertexAttrib4fv(G.location,de);break;default:i.vertexAttrib1fv(G.location,de)}}}}E()}function R(){D();for(let b in n){let P=n[b];for(let O in P){let z=P[O];for(let W in z)h(z[W].object),delete z[W];delete P[O]}delete n[b]}}function C(b){if(n[b.id]===void 0)return;let P=n[b.id];for(let O in P){let z=P[O];for(let W in z)h(z[W].object),delete z[W];delete P[O]}delete n[b.id]}function L(b){for(let P in n){let O=n[P];if(O[b.id]===void 0)continue;let z=O[b.id];for(let W in z)h(z[W].object),delete z[W];delete O[b.id]}}function D(){M(),a=!0,s!==r&&(s=r,c(s.object))}function M(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:D,resetDefaultState:M,dispose:R,releaseStatesOfGeometry:C,releaseStatesOfProgram:L,initAttributes:y,enableAttribute:m,disableUnusedAttributes:E}}function b0(i,e,t){let n;function r(c){n=c}function s(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,d){d!==0&&(i.drawArraysInstanced(n,c,h,d),t.update(h,n,d))}function o(c,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,d);let f=0;for(let g=0;g<d;g++)f+=h[g];t.update(f,n,1)}function l(c,h,d,u){if(d===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)a(c[g],h[g],u[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,u,0,d);let g=0;for(let y=0;y<d;y++)g+=h[y]*u[y];t.update(g,n,1)}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function M0(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let L=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(L){return!(L!==pn&&n.convert(L)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(L){let D=L===yr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(L!==Tn&&n.convert(L)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&L!==Un&&!D)}function l(L){if(L==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";L="mediump"}return L==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),E=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=g>0,C=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:E,maxVaryings:w,maxFragmentUniforms:v,vertexTextures:R,maxSamples:C}}function w0(i){let e=this,t=null,n=0,r=!1,s=!1,a=new dn,o=new ze,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||n!==0||r;return r=u,n=d.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,f){let g=d.clippingPlanes,y=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!r||g===null||g.length===0||s&&!m)s?h(null):c();else{let E=s?0:n,w=E*4,v=p.clippingState||null;l.value=v,v=h(g,u,w,f);for(let R=0;R!==w;++R)v[R]=t[R];p.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=E}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(d,u,f,g){let y=d!==null?d.length:0,m=null;if(y!==0){if(m=l.value,g!==!0||m===null){let p=f+y*4,E=u.matrixWorldInverse;o.getNormalMatrix(E),(m===null||m.length<p)&&(m=new Float32Array(p));for(let w=0,v=f;w!==y;++w,v+=4)a.copy(d[w]).applyMatrix4(E,o),a.normal.toArray(m,v),m[v+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function S0(i){let e=new WeakMap;function t(a,o){return o===Ga?a.mapping=Ii:o===Wa&&(a.mapping=Di),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===Ga||o===Wa)if(e.has(a)){let l=e.get(a).texture;return t(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new pa(l.height);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",r),t(c.texture,a.mapping)}else return null}}return a}function r(a){let o=a.target;o.removeEventListener("dispose",r);let l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}var br=4,od=[.125,.215,.35,.446,.526,.582],Bi=20,tc=new gs,ld=new $e,nc=null,ic=0,rc=0,sc=!1,ki=(1+Math.sqrt(5))/2,xr=1/ki,cd=[new T(-ki,xr,0),new T(ki,xr,0),new T(-xr,0,ki),new T(xr,0,ki),new T(0,ki,-xr),new T(0,ki,xr),new T(-1,1,-1),new T(1,1,-1),new T(-1,1,1),new T(1,1,1)],E0=new T,Po=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,s={}){let{size:a=256,position:o=E0}=s;nc=this._renderer.getRenderTarget(),ic=this._renderer.getActiveCubeFace(),rc=this._renderer.getActiveMipmapLevel(),sc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,r,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ud(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=dd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(nc,ic,rc),this._renderer.xr.enabled=sc,e.scissorTest=!1,Co(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ii||e.mapping===Di?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),nc=this._renderer.getRenderTarget(),ic=this._renderer.getActiveCubeFace(),rc=this._renderer.getActiveMipmapLevel(),sc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:xn,minFilter:xn,generateMipmaps:!1,type:yr,format:pn,colorSpace:Ei,depthBuffer:!1},r=hd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=hd(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=T0(s)),this._blurMaterial=A0(s,e,t)}return r}_compileMaterial(e){let t=new Mt(this._lodPlanes[0],e);this._renderer.compile(t,tc)}_sceneToCubeUV(e,t,n,r,s){let l=new kt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(ld),d.toneMapping=Zn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(r),d.clearDepth(),d.setRenderTarget(null));let y=new $r({name:"PMREM.Background",side:Gt,depthWrite:!1,depthTest:!1}),m=new Mt(new In,y),p=!1,E=e.background;E?E.isColor&&(y.color.copy(E),e.background=null,p=!0):(y.color.copy(ld),p=!0);for(let w=0;w<6;w++){let v=w%3;v===0?(l.up.set(0,c[w],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+h[w],s.y,s.z)):v===1?(l.up.set(0,0,c[w]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+h[w],s.z)):(l.up.set(0,c[w],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+h[w]));let R=this._cubeSize;Co(r,v*R,w>2?R:0,R,R),d.setRenderTarget(r),p&&d.render(m,l),d.render(e,l)}m.geometry.dispose(),m.material.dispose(),d.toneMapping=f,d.autoClear=u,e.background=E}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===Ii||e.mapping===Di;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=ud()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=dd());let s=r?this._cubemapMaterial:this._equirectMaterial,a=new Mt(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;let l=this._cubeSize;Co(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,tc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let s=1;s<r;s++){let a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=cd[(r-s-1)%cd.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,r,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,"latitudinal",s),this._halfBlur(a,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,d=new Mt(this._lodPlanes[r],c),u=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Bi-1),y=s/g,m=isFinite(s)?1+Math.floor(h*y):Bi;m>Bi&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Bi}`);let p=[],E=0;for(let L=0;L<Bi;++L){let D=L/y,M=Math.exp(-D*D/2);p.push(M),L===0?E+=M:L<m&&(E+=2*M)}for(let L=0;L<p.length;L++)p[L]=p[L]/E;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=p,u.latitudinal.value=a==="latitudinal",o&&(u.poleAxis.value=o);let{_lodMax:w}=this;u.dTheta.value=g,u.mipInt.value=w-n;let v=this._sizeLods[r],R=3*v*(r>w-br?r-w+br:0),C=4*(this._cubeSize-v);Co(t,R,C,3*v,2*v),l.setRenderTarget(t),l.render(d,tc)}};function T0(i){let e=[],t=[],n=[],r=i,s=i-br+1+od.length;for(let a=0;a<s;a++){let o=Math.pow(2,r);t.push(o);let l=1/o;a>i-br?l=od[a-i+br-1]:a===0&&(l=0),n.push(l);let c=1/(o-2),h=-c,d=1+c,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,g=6,y=3,m=2,p=1,E=new Float32Array(y*g*f),w=new Float32Array(m*g*f),v=new Float32Array(p*g*f);for(let C=0;C<f;C++){let L=C%3*2/3-1,D=C>2?0:-1,M=[L,D,0,L+2/3,D,0,L+2/3,D+1,0,L,D,0,L+2/3,D+1,0,L,D+1,0];E.set(M,y*g*C),w.set(u,m*g*C);let b=[C,C,C,C,C,C];v.set(b,p*g*C)}let R=new Et;R.setAttribute("position",new nn(E,y)),R.setAttribute("uv",new nn(w,m)),R.setAttribute("faceIndex",new nn(v,p)),e.push(R),r>br&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function hd(i,e,t){let n=new Pn(i,e,t);return n.texture.mapping=_s,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Co(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function A0(i,e,t){let n=new Float32Array(Bi),r=new T(0,1,0);return new Mn({name:"SphericalGaussianBlur",defines:{n:Bi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:mc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:$n,depthTest:!1,depthWrite:!1})}function dd(){return new Mn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:mc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:$n,depthTest:!1,depthWrite:!1})}function ud(){return new Mn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:mc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:$n,depthTest:!1,depthWrite:!1})}function mc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function C0(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){let l=o.mapping,c=l===Ga||l===Wa,h=l===Ii||l===Di;if(c||h){let d=e.get(o),u=d!==void 0?d.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==u)return t===null&&(t=new Po(i)),d=c?t.fromEquirectangular(o,d):t.fromCubemap(o,d),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),d.texture;if(d!==void 0)return d.texture;{let f=o.image;return c&&f&&f.height>0||h&&f&&r(f)?(t===null&&(t=new Po(i)),d=c?t.fromEquirectangular(o):t.fromCubemap(o),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),o.addEventListener("dispose",s),d.texture):null}}}return o}function r(o){let l=0,c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function s(o){let l=o.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function R0(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let r=t(n);return r===null&&or("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function P0(i,e,t,n){let r={},s=new WeakMap;function a(d){let u=d.target;u.index!==null&&e.remove(u.index);for(let g in u.attributes)e.remove(u.attributes[g]);u.removeEventListener("dispose",a),delete r[u.id];let f=s.get(u);f&&(e.remove(f),s.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(d,u){return r[u.id]===!0||(u.addEventListener("dispose",a),r[u.id]=!0,t.memory.geometries++),u}function l(d){let u=d.attributes;for(let f in u)e.update(u[f],i.ARRAY_BUFFER)}function c(d){let u=[],f=d.index,g=d.attributes.position,y=0;if(f!==null){let E=f.array;y=f.version;for(let w=0,v=E.length;w<v;w+=3){let R=E[w+0],C=E[w+1],L=E[w+2];u.push(R,C,C,L,L,R)}}else if(g!==void 0){let E=g.array;y=g.version;for(let w=0,v=E.length/3-1;w<v;w+=3){let R=w+0,C=w+1,L=w+2;u.push(R,C,C,L,L,R)}}else return;let m=new(Zl(u)?Jr:Zr)(u,1);m.version=y;let p=s.get(d);p&&e.remove(p),s.set(d,m)}function h(d){let u=s.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return s.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function L0(i,e,t){let n;function r(u){n=u}let s,a;function o(u){s=u.type,a=u.bytesPerElement}function l(u,f){i.drawElements(n,f,s,u*a),t.update(f,n,1)}function c(u,f,g){g!==0&&(i.drawElementsInstanced(n,f,s,u*a,g),t.update(f,n,g))}function h(u,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,s,u,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function d(u,f,g,y){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<u.length;p++)c(u[p]/a,f[p],y[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,s,u,0,y,0,g);let p=0;for(let E=0;E<g;E++)p+=f[E]*y[E];t.update(p,n,1)}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=d}function I0(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(s/3);break;case i.LINES:t.lines+=o*(s/2);break;case i.LINE_STRIP:t.lines+=o*(s-1);break;case i.LINE_LOOP:t.lines+=o*s;break;case i.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function D0(i,e,t){let n=new WeakMap,r=new vt;function s(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=n.get(o);if(u===void 0||u.count!==d){let M=function(){L.dispose(),n.delete(o),o.removeEventListener("dispose",M)};u!==void 0&&u.texture.dispose();let f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],E=o.morphAttributes.color||[],w=0;f===!0&&(w=1),g===!0&&(w=2),y===!0&&(w=3);let v=o.attributes.position.count*w,R=1;v>e.maxTextureSize&&(R=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let C=new Float32Array(v*R*4*d),L=new qr(C,v,R,d);L.type=Un,L.needsUpdate=!0;let D=w*4;for(let b=0;b<d;b++){let P=m[b],O=p[b],z=E[b],W=v*R*4*b;for(let q=0;q<P.count;q++){let V=q*D;f===!0&&(r.fromBufferAttribute(P,q),C[W+V+0]=r.x,C[W+V+1]=r.y,C[W+V+2]=r.z,C[W+V+3]=0),g===!0&&(r.fromBufferAttribute(O,q),C[W+V+4]=r.x,C[W+V+5]=r.y,C[W+V+6]=r.z,C[W+V+7]=0),y===!0&&(r.fromBufferAttribute(z,q),C[W+V+8]=r.x,C[W+V+9]=r.y,C[W+V+10]=r.z,C[W+V+11]=z.itemSize===4?r.w:1)}}u={count:d,texture:L,size:new ce(v,R)},n.set(o,u),o.addEventListener("dispose",M)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];let g=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:s}}function N0(i,e,t,n){let r=new WeakMap;function s(l){let c=n.render.frame,h=l.geometry,d=e.get(l,h);if(r.get(d)!==c&&(e.update(d),r.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let u=l.skeleton;r.get(u)!==c&&(u.update(),r.set(u,c))}return d}function a(){r=new WeakMap}function o(l){let c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:a}}var Ld=new rn,pd=new es(1,1),Id=new qr,Dd=new da,Nd=new jr,fd=[],md=[],gd=new Float32Array(16),yd=new Float32Array(9),_d=new Float32Array(4);function wr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=fd[r];if(s===void 0&&(s=new Float32Array(r),fd[r]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(s,o)}return s}function Rt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Pt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Io(i,e){let t=md[e];t===void 0&&(t=new Int32Array(e),md[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function U0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function F0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Rt(t,e))return;i.uniform2fv(this.addr,e),Pt(t,e)}}function O0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Rt(t,e))return;i.uniform3fv(this.addr,e),Pt(t,e)}}function k0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Rt(t,e))return;i.uniform4fv(this.addr,e),Pt(t,e)}}function B0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Rt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Pt(t,e)}else{if(Rt(t,n))return;_d.set(n),i.uniformMatrix2fv(this.addr,!1,_d),Pt(t,n)}}function z0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Rt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Pt(t,e)}else{if(Rt(t,n))return;yd.set(n),i.uniformMatrix3fv(this.addr,!1,yd),Pt(t,n)}}function H0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Rt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Pt(t,e)}else{if(Rt(t,n))return;gd.set(n),i.uniformMatrix4fv(this.addr,!1,gd),Pt(t,n)}}function V0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function G0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Rt(t,e))return;i.uniform2iv(this.addr,e),Pt(t,e)}}function W0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Rt(t,e))return;i.uniform3iv(this.addr,e),Pt(t,e)}}function X0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Rt(t,e))return;i.uniform4iv(this.addr,e),Pt(t,e)}}function q0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Y0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Rt(t,e))return;i.uniform2uiv(this.addr,e),Pt(t,e)}}function $0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Rt(t,e))return;i.uniform3uiv(this.addr,e),Pt(t,e)}}function Z0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Rt(t,e))return;i.uniform4uiv(this.addr,e),Pt(t,e)}}function J0(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(pd.compareFunction=ql,s=pd):s=Ld,t.setTexture2D(e||s,r)}function K0(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Dd,r)}function j0(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||Nd,r)}function Q0(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||Id,r)}function eg(i){switch(i){case 5126:return U0;case 35664:return F0;case 35665:return O0;case 35666:return k0;case 35674:return B0;case 35675:return z0;case 35676:return H0;case 5124:case 35670:return V0;case 35667:case 35671:return G0;case 35668:case 35672:return W0;case 35669:case 35673:return X0;case 5125:return q0;case 36294:return Y0;case 36295:return $0;case 36296:return Z0;case 35678:case 36198:case 36298:case 36306:case 35682:return J0;case 35679:case 36299:case 36307:return K0;case 35680:case 36300:case 36308:case 36293:return j0;case 36289:case 36303:case 36311:case 36292:return Q0}}function tg(i,e){i.uniform1fv(this.addr,e)}function ng(i,e){let t=wr(e,this.size,2);i.uniform2fv(this.addr,t)}function ig(i,e){let t=wr(e,this.size,3);i.uniform3fv(this.addr,t)}function rg(i,e){let t=wr(e,this.size,4);i.uniform4fv(this.addr,t)}function sg(i,e){let t=wr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function ag(i,e){let t=wr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function og(i,e){let t=wr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function lg(i,e){i.uniform1iv(this.addr,e)}function cg(i,e){i.uniform2iv(this.addr,e)}function hg(i,e){i.uniform3iv(this.addr,e)}function dg(i,e){i.uniform4iv(this.addr,e)}function ug(i,e){i.uniform1uiv(this.addr,e)}function pg(i,e){i.uniform2uiv(this.addr,e)}function fg(i,e){i.uniform3uiv(this.addr,e)}function mg(i,e){i.uniform4uiv(this.addr,e)}function gg(i,e,t){let n=this.cache,r=e.length,s=Io(t,r);Rt(n,s)||(i.uniform1iv(this.addr,s),Pt(n,s));for(let a=0;a!==r;++a)t.setTexture2D(e[a]||Ld,s[a])}function yg(i,e,t){let n=this.cache,r=e.length,s=Io(t,r);Rt(n,s)||(i.uniform1iv(this.addr,s),Pt(n,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||Dd,s[a])}function _g(i,e,t){let n=this.cache,r=e.length,s=Io(t,r);Rt(n,s)||(i.uniform1iv(this.addr,s),Pt(n,s));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||Nd,s[a])}function vg(i,e,t){let n=this.cache,r=e.length,s=Io(t,r);Rt(n,s)||(i.uniform1iv(this.addr,s),Pt(n,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||Id,s[a])}function xg(i){switch(i){case 5126:return tg;case 35664:return ng;case 35665:return ig;case 35666:return rg;case 35674:return sg;case 35675:return ag;case 35676:return og;case 5124:case 35670:return lg;case 35667:case 35671:return cg;case 35668:case 35672:return hg;case 35669:case 35673:return dg;case 5125:return ug;case 36294:return pg;case 36295:return fg;case 36296:return mg;case 35678:case 36198:case 36298:case 36306:case 35682:return gg;case 35679:case 36299:case 36307:return yg;case 35680:case 36300:case 36308:case 36293:return _g;case 36289:case 36303:case 36311:case 36292:return vg}}var oc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=eg(t.type)}},lc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=xg(t.type)}},cc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,a=r.length;s!==a;++s){let o=r[s];o.setValue(e,t[o.id],n)}}},ac=/(\w+)(\])?(\[|\.)?/g;function vd(i,e){i.seq.push(e),i.map[e.id]=e}function bg(i,e,t){let n=i.name,r=n.length;for(ac.lastIndex=0;;){let s=ac.exec(n),a=ac.lastIndex,o=s[1],l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){vd(t,c===void 0?new oc(o,i,e):new lc(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new cc(o),vd(t,d)),t=d}}}var Mr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let s=e.getActiveUniform(t,r),a=e.getUniformLocation(t,s.name);bg(s,a,this)}}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,a=t.length;s!==a;++s){let o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let a=e[r];a.id in t&&n.push(a)}return n}};function xd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Mg=37297,wg=0;function Sg(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var bd=new ze;function Eg(i){je._getMatrix(bd,je.workingColorSpace,i);let e=`mat3( ${bd.elements.map(t=>t.toFixed(4))} )`;switch(je.getTransfer(i)){case Gr:return[e,"LinearTransferOETF"];case it:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Md(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=(i.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";let a=/ERROR: 0:(\d+)/.exec(s);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+Sg(i.getShaderSource(e),o)}else return s}function Tg(i,e){let t=Eg(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Ag(i,e){let t;switch(e){case Uh:t="Linear";break;case Fh:t="Reinhard";break;case Oh:t="Cineon";break;case Va:t="ACESFilmic";break;case Bh:t="AgX";break;case zh:t="Neutral";break;case kh:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Ro=new T;function Cg(){je.getLuminanceCoefficients(Ro);let i=Ro.x.toFixed(4),e=Ro.y.toFixed(4),t=Ro.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Rg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ss).join(`
`)}function Pg(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Lg(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),a=s.name,o=1;s.type===i.FLOAT_MAT2&&(o=2),s.type===i.FLOAT_MAT3&&(o=3),s.type===i.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Ss(i){return i!==""}function wd(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Sd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Ig=/^[ \t]*#include +<([\w\d./]+)>/gm;function hc(i){return i.replace(Ig,Ng)}var Dg=new Map;function Ng(i,e){let t=We[e];if(t===void 0){let n=Dg.get(e);if(n!==void 0)t=We[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return hc(t)}var Ug=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ed(i){return i.replace(Ug,Fg)}function Fg(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Td(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Og(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Ll?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Na?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Nn&&(e="SHADOWMAP_TYPE_VSM"),e}function kg(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ii:case Di:e="ENVMAP_TYPE_CUBE";break;case _s:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Bg(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Di:e="ENVMAP_MODE_REFRACTION";break}return e}function zg(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Ul:e="ENVMAP_BLENDING_MULTIPLY";break;case Dh:e="ENVMAP_BLENDING_MIX";break;case Nh:e="ENVMAP_BLENDING_ADD";break}return e}function Hg(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Vg(i,e,t,n){let r=i.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,l=Og(t),c=kg(t),h=Bg(t),d=zg(t),u=Hg(t),f=Rg(t),g=Pg(s),y=r.createProgram(),m,p,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ss).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ss).join(`
`),p.length>0&&(p+=`
`)):(m=[Td(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ss).join(`
`),p=[Td(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Zn?"#define TONE_MAPPING":"",t.toneMapping!==Zn?We.tonemapping_pars_fragment:"",t.toneMapping!==Zn?Ag("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",We.colorspace_pars_fragment,Tg("linearToOutputTexel",t.outputColorSpace),Cg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ss).join(`
`)),a=hc(a),a=wd(a,t),a=Sd(a,t),o=hc(o),o=wd(o,t),o=Sd(o,t),a=Ed(a),o=Ed(o),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Yl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Yl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let w=E+m+a,v=E+p+o,R=xd(r,r.VERTEX_SHADER,w),C=xd(r,r.FRAGMENT_SHADER,v);r.attachShader(y,R),r.attachShader(y,C),t.index0AttributeName!==void 0?r.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(y,0,"position"),r.linkProgram(y);function L(P){if(i.debug.checkShaderErrors){let O=r.getProgramInfoLog(y)||"",z=r.getShaderInfoLog(R)||"",W=r.getShaderInfoLog(C)||"",q=O.trim(),V=z.trim(),te=W.trim(),G=!0,le=!0;if(r.getProgramParameter(y,r.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,y,R,C);else{let de=Md(r,R,"vertex"),ge=Md(r,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(y,r.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+q+`
`+de+`
`+ge)}else q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",q):(V===""||te==="")&&(le=!1);le&&(P.diagnostics={runnable:G,programLog:q,vertexShader:{log:V,prefix:m},fragmentShader:{log:te,prefix:p}})}r.deleteShader(R),r.deleteShader(C),D=new Mr(r,y),M=Lg(r,y)}let D;this.getUniforms=function(){return D===void 0&&L(this),D};let M;this.getAttributes=function(){return M===void 0&&L(this),M};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=r.getProgramParameter(y,Mg)),b},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=wg++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=R,this.fragmentShader=C,this}var Gg=0,dc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new uc(e),t.set(e,n)),n}},uc=class{constructor(e){this.id=Gg++,this.code=e,this.usedTimes=0}};function Wg(i,e,t,n,r,s,a){let o=new Yr,l=new dc,c=new Set,h=[],d=r.logarithmicDepthBuffer,u=r.vertexTextures,f=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(M){return c.add(M),M===0?"uv":`uv${M}`}function m(M,b,P,O,z){let W=O.fog,q=z.geometry,V=M.isMeshStandardMaterial?O.environment:null,te=(M.isMeshStandardMaterial?t:e).get(M.envMap||V),G=te&&te.mapping===_s?te.image.height:null,le=g[M.type];M.precision!==null&&(f=r.getMaxPrecision(M.precision),f!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",f,"instead."));let de=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,ge=de!==void 0?de.length:0,De=0;q.morphAttributes.position!==void 0&&(De=1),q.morphAttributes.normal!==void 0&&(De=2),q.morphAttributes.color!==void 0&&(De=3);let Ye,Qe,Xe,Y;if(le){let nt=Fn[le];Ye=nt.vertexShader,Qe=nt.fragmentShader}else Ye=M.vertexShader,Qe=M.fragmentShader,l.update(M),Xe=l.getVertexShaderID(M),Y=l.getFragmentShaderID(M);let ee=i.getRenderTarget(),be=i.state.buffers.depth.getReversed(),Pe=z.isInstancedMesh===!0,Se=z.isBatchedMesh===!0,Ze=!!M.map,lt=!!M.matcap,A=!!te,Q=!!M.aoMap,J=!!M.lightMap,Z=!!M.bumpMap,$=!!M.normalMap,ue=!!M.displacementMap,ie=!!M.emissiveMap,pe=!!M.metalnessMap,ke=!!M.roughnessMap,Oe=M.anisotropy>0,S=M.clearcoat>0,_=M.dispersion>0,F=M.iridescence>0,H=M.sheen>0,j=M.transmission>0,X=Oe&&!!M.anisotropyMap,Ce=S&&!!M.clearcoatMap,he=S&&!!M.clearcoatNormalMap,Ee=S&&!!M.clearcoatRoughnessMap,Te=F&&!!M.iridescenceMap,re=F&&!!M.iridescenceThicknessMap,ve=H&&!!M.sheenColorMap,Ue=H&&!!M.sheenRoughnessMap,Re=!!M.specularMap,ye=!!M.specularColorMap,He=!!M.specularIntensityMap,I=j&&!!M.transmissionMap,oe=j&&!!M.thicknessMap,fe=!!M.gradientMap,Me=!!M.alphaMap,se=M.alphaTest>0,K=!!M.alphaHash,Ae=!!M.extensions,Be=Zn;M.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Be=i.toneMapping);let ct={shaderID:le,shaderType:M.type,shaderName:M.name,vertexShader:Ye,fragmentShader:Qe,defines:M.defines,customVertexShaderID:Xe,customFragmentShaderID:Y,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:f,batching:Se,batchingColor:Se&&z._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&z.instanceColor!==null,instancingMorph:Pe&&z.morphTexture!==null,supportsVertexTextures:u,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Ei,alphaToCoverage:!!M.alphaToCoverage,map:Ze,matcap:lt,envMap:A,envMapMode:A&&te.mapping,envMapCubeUVHeight:G,aoMap:Q,lightMap:J,bumpMap:Z,normalMap:$,displacementMap:u&&ue,emissiveMap:ie,normalMapObjectSpace:$&&M.normalMapType===Wh,normalMapTangentSpace:$&&M.normalMapType===Xl,metalnessMap:pe,roughnessMap:ke,anisotropy:Oe,anisotropyMap:X,clearcoat:S,clearcoatMap:Ce,clearcoatNormalMap:he,clearcoatRoughnessMap:Ee,dispersion:_,iridescence:F,iridescenceMap:Te,iridescenceThicknessMap:re,sheen:H,sheenColorMap:ve,sheenRoughnessMap:Ue,specularMap:Re,specularColorMap:ye,specularIntensityMap:He,transmission:j,transmissionMap:I,thicknessMap:oe,gradientMap:fe,opaque:M.transparent===!1&&M.blending===wi&&M.alphaToCoverage===!1,alphaMap:Me,alphaTest:se,alphaHash:K,combine:M.combine,mapUv:Ze&&y(M.map.channel),aoMapUv:Q&&y(M.aoMap.channel),lightMapUv:J&&y(M.lightMap.channel),bumpMapUv:Z&&y(M.bumpMap.channel),normalMapUv:$&&y(M.normalMap.channel),displacementMapUv:ue&&y(M.displacementMap.channel),emissiveMapUv:ie&&y(M.emissiveMap.channel),metalnessMapUv:pe&&y(M.metalnessMap.channel),roughnessMapUv:ke&&y(M.roughnessMap.channel),anisotropyMapUv:X&&y(M.anisotropyMap.channel),clearcoatMapUv:Ce&&y(M.clearcoatMap.channel),clearcoatNormalMapUv:he&&y(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&y(M.clearcoatRoughnessMap.channel),iridescenceMapUv:Te&&y(M.iridescenceMap.channel),iridescenceThicknessMapUv:re&&y(M.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&y(M.sheenColorMap.channel),sheenRoughnessMapUv:Ue&&y(M.sheenRoughnessMap.channel),specularMapUv:Re&&y(M.specularMap.channel),specularColorMapUv:ye&&y(M.specularColorMap.channel),specularIntensityMapUv:He&&y(M.specularIntensityMap.channel),transmissionMapUv:I&&y(M.transmissionMap.channel),thicknessMapUv:oe&&y(M.thicknessMap.channel),alphaMapUv:Me&&y(M.alphaMap.channel),vertexTangents:!!q.attributes.tangent&&($||Oe),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!q.attributes.uv&&(Ze||Me),fog:!!W,useFog:M.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:be,skinning:z.isSkinnedMesh===!0,morphTargets:q.morphAttributes.position!==void 0,morphNormals:q.morphAttributes.normal!==void 0,morphColors:q.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:De,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Be,decodeVideoTexture:Ze&&M.map.isVideoTexture===!0&&je.getTransfer(M.map.colorSpace)===it,decodeVideoTextureEmissive:ie&&M.emissiveMap.isVideoTexture===!0&&je.getTransfer(M.emissiveMap.colorSpace)===it,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===$t,flipSided:M.side===Gt,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Ae&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ae&&M.extensions.multiDraw===!0||Se)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return ct.vertexUv1s=c.has(1),ct.vertexUv2s=c.has(2),ct.vertexUv3s=c.has(3),c.clear(),ct}function p(M){let b=[];if(M.shaderID?b.push(M.shaderID):(b.push(M.customVertexShaderID),b.push(M.customFragmentShaderID)),M.defines!==void 0)for(let P in M.defines)b.push(P),b.push(M.defines[P]);return M.isRawShaderMaterial===!1&&(E(b,M),w(b,M),b.push(i.outputColorSpace)),b.push(M.customProgramCacheKey),b.join()}function E(M,b){M.push(b.precision),M.push(b.outputColorSpace),M.push(b.envMapMode),M.push(b.envMapCubeUVHeight),M.push(b.mapUv),M.push(b.alphaMapUv),M.push(b.lightMapUv),M.push(b.aoMapUv),M.push(b.bumpMapUv),M.push(b.normalMapUv),M.push(b.displacementMapUv),M.push(b.emissiveMapUv),M.push(b.metalnessMapUv),M.push(b.roughnessMapUv),M.push(b.anisotropyMapUv),M.push(b.clearcoatMapUv),M.push(b.clearcoatNormalMapUv),M.push(b.clearcoatRoughnessMapUv),M.push(b.iridescenceMapUv),M.push(b.iridescenceThicknessMapUv),M.push(b.sheenColorMapUv),M.push(b.sheenRoughnessMapUv),M.push(b.specularMapUv),M.push(b.specularColorMapUv),M.push(b.specularIntensityMapUv),M.push(b.transmissionMapUv),M.push(b.thicknessMapUv),M.push(b.combine),M.push(b.fogExp2),M.push(b.sizeAttenuation),M.push(b.morphTargetsCount),M.push(b.morphAttributeCount),M.push(b.numDirLights),M.push(b.numPointLights),M.push(b.numSpotLights),M.push(b.numSpotLightMaps),M.push(b.numHemiLights),M.push(b.numRectAreaLights),M.push(b.numDirLightShadows),M.push(b.numPointLightShadows),M.push(b.numSpotLightShadows),M.push(b.numSpotLightShadowsWithMaps),M.push(b.numLightProbes),M.push(b.shadowMapType),M.push(b.toneMapping),M.push(b.numClippingPlanes),M.push(b.numClipIntersection),M.push(b.depthPacking)}function w(M,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),b.gradientMap&&o.enable(22),M.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),M.push(o.mask)}function v(M){let b=g[M.type],P;if(b){let O=Fn[b];P=td.clone(O.uniforms)}else P=M.uniforms;return P}function R(M,b){let P;for(let O=0,z=h.length;O<z;O++){let W=h[O];if(W.cacheKey===b){P=W,++P.usedTimes;break}}return P===void 0&&(P=new Vg(i,b,M,s),h.push(P)),P}function C(M){if(--M.usedTimes===0){let b=h.indexOf(M);h[b]=h[h.length-1],h.pop(),M.destroy()}}function L(M){l.remove(M)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:R,releaseProgram:C,releaseShaderCache:L,programs:h,dispose:D}}function Xg(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function r(a,o,l){i.get(a)[o]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function qg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Ad(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Cd(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function a(d,u,f,g,y,m){let p=i[e];return p===void 0?(p={id:d.id,object:d,geometry:u,material:f,groupOrder:g,renderOrder:d.renderOrder,z:y,group:m},i[e]=p):(p.id=d.id,p.object=d,p.geometry=u,p.material=f,p.groupOrder=g,p.renderOrder=d.renderOrder,p.z=y,p.group=m),e++,p}function o(d,u,f,g,y,m){let p=a(d,u,f,g,y,m);f.transmission>0?n.push(p):f.transparent===!0?r.push(p):t.push(p)}function l(d,u,f,g,y,m){let p=a(d,u,f,g,y,m);f.transmission>0?n.unshift(p):f.transparent===!0?r.unshift(p):t.unshift(p)}function c(d,u){t.length>1&&t.sort(d||qg),n.length>1&&n.sort(u||Ad),r.length>1&&r.sort(u||Ad)}function h(){for(let d=e,u=i.length;d<u;d++){let f=i[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:o,unshift:l,finish:h,sort:c}}function Yg(){let i=new WeakMap;function e(n,r){let s=i.get(n),a;return s===void 0?(a=new Cd,i.set(n,[a])):r>=s.length?(a=new Cd,s.push(a)):a=s[r],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function $g(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new T,color:new $e};break;case"SpotLight":t={position:new T,direction:new T,color:new $e,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new T,color:new $e,distance:0,decay:0};break;case"HemisphereLight":t={direction:new T,skyColor:new $e,groundColor:new $e};break;case"RectAreaLight":t={color:new $e,position:new T,halfWidth:new T,halfHeight:new T};break}return i[e.id]=t,t}}}function Zg(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Jg=0;function Kg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function jg(i){let e=new $g,t=Zg(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new T);let r=new T,s=new ft,a=new ft;function o(c){let h=0,d=0,u=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let f=0,g=0,y=0,m=0,p=0,E=0,w=0,v=0,R=0,C=0,L=0;c.sort(Kg);for(let M=0,b=c.length;M<b;M++){let P=c[M],O=P.color,z=P.intensity,W=P.distance,q=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=O.r*z,d+=O.g*z,u+=O.b*z;else if(P.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(P.sh.coefficients[V],z);L++}else if(P.isDirectionalLight){let V=e.get(P);if(V.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let te=P.shadow,G=t.get(P);G.shadowIntensity=te.intensity,G.shadowBias=te.bias,G.shadowNormalBias=te.normalBias,G.shadowRadius=te.radius,G.shadowMapSize=te.mapSize,n.directionalShadow[f]=G,n.directionalShadowMap[f]=q,n.directionalShadowMatrix[f]=P.shadow.matrix,E++}n.directional[f]=V,f++}else if(P.isSpotLight){let V=e.get(P);V.position.setFromMatrixPosition(P.matrixWorld),V.color.copy(O).multiplyScalar(z),V.distance=W,V.coneCos=Math.cos(P.angle),V.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),V.decay=P.decay,n.spot[y]=V;let te=P.shadow;if(P.map&&(n.spotLightMap[R]=P.map,R++,te.updateMatrices(P),P.castShadow&&C++),n.spotLightMatrix[y]=te.matrix,P.castShadow){let G=t.get(P);G.shadowIntensity=te.intensity,G.shadowBias=te.bias,G.shadowNormalBias=te.normalBias,G.shadowRadius=te.radius,G.shadowMapSize=te.mapSize,n.spotShadow[y]=G,n.spotShadowMap[y]=q,v++}y++}else if(P.isRectAreaLight){let V=e.get(P);V.color.copy(O).multiplyScalar(z),V.halfWidth.set(P.width*.5,0,0),V.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=V,m++}else if(P.isPointLight){let V=e.get(P);if(V.color.copy(P.color).multiplyScalar(P.intensity),V.distance=P.distance,V.decay=P.decay,P.castShadow){let te=P.shadow,G=t.get(P);G.shadowIntensity=te.intensity,G.shadowBias=te.bias,G.shadowNormalBias=te.normalBias,G.shadowRadius=te.radius,G.shadowMapSize=te.mapSize,G.shadowCameraNear=te.camera.near,G.shadowCameraFar=te.camera.far,n.pointShadow[g]=G,n.pointShadowMap[g]=q,n.pointShadowMatrix[g]=P.shadow.matrix,w++}n.point[g]=V,g++}else if(P.isHemisphereLight){let V=e.get(P);V.skyColor.copy(P.color).multiplyScalar(z),V.groundColor.copy(P.groundColor).multiplyScalar(z),n.hemi[p]=V,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=me.LTC_FLOAT_1,n.rectAreaLTC2=me.LTC_FLOAT_2):(n.rectAreaLTC1=me.LTC_HALF_1,n.rectAreaLTC2=me.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;let D=n.hash;(D.directionalLength!==f||D.pointLength!==g||D.spotLength!==y||D.rectAreaLength!==m||D.hemiLength!==p||D.numDirectionalShadows!==E||D.numPointShadows!==w||D.numSpotShadows!==v||D.numSpotMaps!==R||D.numLightProbes!==L)&&(n.directional.length=f,n.spot.length=y,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=w,n.pointShadowMap.length=w,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=w,n.spotLightMatrix.length=v+R-C,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=C,n.numLightProbes=L,D.directionalLength=f,D.pointLength=g,D.spotLength=y,D.rectAreaLength=m,D.hemiLength=p,D.numDirectionalShadows=E,D.numPointShadows=w,D.numSpotShadows=v,D.numSpotMaps=R,D.numLightProbes=L,n.version=Jg++)}function l(c,h){let d=0,u=0,f=0,g=0,y=0,m=h.matrixWorldInverse;for(let p=0,E=c.length;p<E;p++){let w=c[p];if(w.isDirectionalLight){let v=n.directional[d];v.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),d++}else if(w.isSpotLight){let v=n.spot[f];v.position.setFromMatrixPosition(w.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),f++}else if(w.isRectAreaLight){let v=n.rectArea[g];v.position.setFromMatrixPosition(w.matrixWorld),v.position.applyMatrix4(m),a.identity(),s.copy(w.matrixWorld),s.premultiply(m),a.extractRotation(s),v.halfWidth.set(w.width*.5,0,0),v.halfHeight.set(0,w.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),g++}else if(w.isPointLight){let v=n.point[u];v.position.setFromMatrixPosition(w.matrixWorld),v.position.applyMatrix4(m),u++}else if(w.isHemisphereLight){let v=n.hemi[y];v.direction.setFromMatrixPosition(w.matrixWorld),v.direction.transformDirection(m),y++}}}return{setup:o,setupView:l,state:n}}function Rd(i){let e=new jg(i),t=[],n=[];function r(h){c.camera=h,t.length=0,n.length=0}function s(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function Qg(i){let e=new WeakMap;function t(r,s=0){let a=e.get(r),o;return a===void 0?(o=new Rd(i),e.set(r,[o])):s>=a.length?(o=new Rd(i),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var ey=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ty=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function ny(i,e,t){let n=new hr,r=new ce,s=new ce,a=new vt,o=new Ma({depthPacking:Gh}),l=new wa,c={},h=t.maxTextureSize,d={[Xn]:Gt,[Gt]:Xn,[$t]:$t},u=new Mn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ce},radius:{value:4}},vertexShader:ey,fragmentShader:ty}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let g=new Et;g.setAttribute("position",new nn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Mt(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ll;let p=this.type;this.render=function(C,L,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;let M=i.getRenderTarget(),b=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),O=i.state;O.setBlending($n),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);let z=p!==Nn&&this.type===Nn,W=p===Nn&&this.type!==Nn;for(let q=0,V=C.length;q<V;q++){let te=C[q],G=te.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",te,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;r.copy(G.mapSize);let le=G.getFrameExtents();if(r.multiply(le),s.copy(G.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/le.x),r.x=s.x*le.x,G.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/le.y),r.y=s.y*le.y,G.mapSize.y=s.y)),G.map===null||z===!0||W===!0){let ge=this.type!==Nn?{minFilter:un,magFilter:un}:{};G.map!==null&&G.map.dispose(),G.map=new Pn(r.x,r.y,ge),G.map.texture.name=te.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();let de=G.getViewportCount();for(let ge=0;ge<de;ge++){let De=G.getViewport(ge);a.set(s.x*De.x,s.y*De.y,s.x*De.z,s.y*De.w),O.viewport(a),G.updateMatrices(te,ge),n=G.getFrustum(),v(L,D,G.camera,te,this.type)}G.isPointLightShadow!==!0&&this.type===Nn&&E(G,D),G.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(M,b,P)};function E(C,L){let D=e.update(y);u.defines.VSM_SAMPLES!==C.blurSamples&&(u.defines.VSM_SAMPLES=C.blurSamples,f.defines.VSM_SAMPLES=C.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new Pn(r.x,r.y)),u.uniforms.shadow_pass.value=C.map.texture,u.uniforms.resolution.value=C.mapSize,u.uniforms.radius.value=C.radius,i.setRenderTarget(C.mapPass),i.clear(),i.renderBufferDirect(L,null,D,u,y,null),f.uniforms.shadow_pass.value=C.mapPass.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,i.setRenderTarget(C.map),i.clear(),i.renderBufferDirect(L,null,D,f,y,null)}function w(C,L,D,M){let b=null,P=D.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(P!==void 0)b=P;else if(b=D.isPointLight===!0?l:o,i.localClippingEnabled&&L.clipShadows===!0&&Array.isArray(L.clippingPlanes)&&L.clippingPlanes.length!==0||L.displacementMap&&L.displacementScale!==0||L.alphaMap&&L.alphaTest>0||L.map&&L.alphaTest>0||L.alphaToCoverage===!0){let O=b.uuid,z=L.uuid,W=c[O];W===void 0&&(W={},c[O]=W);let q=W[z];q===void 0&&(q=b.clone(),W[z]=q,L.addEventListener("dispose",R)),b=q}if(b.visible=L.visible,b.wireframe=L.wireframe,M===Nn?b.side=L.shadowSide!==null?L.shadowSide:L.side:b.side=L.shadowSide!==null?L.shadowSide:d[L.side],b.alphaMap=L.alphaMap,b.alphaTest=L.alphaToCoverage===!0?.5:L.alphaTest,b.map=L.map,b.clipShadows=L.clipShadows,b.clippingPlanes=L.clippingPlanes,b.clipIntersection=L.clipIntersection,b.displacementMap=L.displacementMap,b.displacementScale=L.displacementScale,b.displacementBias=L.displacementBias,b.wireframeLinewidth=L.wireframeLinewidth,b.linewidth=L.linewidth,D.isPointLight===!0&&b.isMeshDistanceMaterial===!0){let O=i.properties.get(b);O.light=D}return b}function v(C,L,D,M,b){if(C.visible===!1)return;if(C.layers.test(L.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&b===Nn)&&(!C.frustumCulled||n.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,C.matrixWorld);let z=e.update(C),W=C.material;if(Array.isArray(W)){let q=z.groups;for(let V=0,te=q.length;V<te;V++){let G=q[V],le=W[G.materialIndex];if(le&&le.visible){let de=w(C,le,M,b);C.onBeforeShadow(i,C,L,D,z,de,G),i.renderBufferDirect(D,null,z,de,C,G),C.onAfterShadow(i,C,L,D,z,de,G)}}}else if(W.visible){let q=w(C,W,M,b);C.onBeforeShadow(i,C,L,D,z,q,null),i.renderBufferDirect(D,null,z,q,C,null),C.onAfterShadow(i,C,L,D,z,q,null)}}let O=C.children;for(let z=0,W=O.length;z<W;z++)v(O[z],L,D,M,b)}function R(C){C.target.removeEventListener("dispose",R);for(let D in c){let M=c[D],b=C.target.uuid;b in M&&(M[b].dispose(),delete M[b])}}}var iy={[Ua]:Fa,[Oa]:za,[ka]:Ha,[Si]:Ba,[Fa]:Ua,[za]:Oa,[Ha]:ka,[Ba]:Si};function ry(i,e){function t(){let I=!1,oe=new vt,fe=null,Me=new vt(0,0,0,0);return{setMask:function(se){fe!==se&&!I&&(i.colorMask(se,se,se,se),fe=se)},setLocked:function(se){I=se},setClear:function(se,K,Ae,Be,ct){ct===!0&&(se*=Be,K*=Be,Ae*=Be),oe.set(se,K,Ae,Be),Me.equals(oe)===!1&&(i.clearColor(se,K,Ae,Be),Me.copy(oe))},reset:function(){I=!1,fe=null,Me.set(-1,0,0,0)}}}function n(){let I=!1,oe=!1,fe=null,Me=null,se=null;return{setReversed:function(K){if(oe!==K){let Ae=e.get("EXT_clip_control");K?Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.ZERO_TO_ONE_EXT):Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.NEGATIVE_ONE_TO_ONE_EXT),oe=K;let Be=se;se=null,this.setClear(Be)}},getReversed:function(){return oe},setTest:function(K){K?ee(i.DEPTH_TEST):be(i.DEPTH_TEST)},setMask:function(K){fe!==K&&!I&&(i.depthMask(K),fe=K)},setFunc:function(K){if(oe&&(K=iy[K]),Me!==K){switch(K){case Ua:i.depthFunc(i.NEVER);break;case Fa:i.depthFunc(i.ALWAYS);break;case Oa:i.depthFunc(i.LESS);break;case Si:i.depthFunc(i.LEQUAL);break;case ka:i.depthFunc(i.EQUAL);break;case Ba:i.depthFunc(i.GEQUAL);break;case za:i.depthFunc(i.GREATER);break;case Ha:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Me=K}},setLocked:function(K){I=K},setClear:function(K){se!==K&&(oe&&(K=1-K),i.clearDepth(K),se=K)},reset:function(){I=!1,fe=null,Me=null,se=null,oe=!1}}}function r(){let I=!1,oe=null,fe=null,Me=null,se=null,K=null,Ae=null,Be=null,ct=null;return{setTest:function(nt){I||(nt?ee(i.STENCIL_TEST):be(i.STENCIL_TEST))},setMask:function(nt){oe!==nt&&!I&&(i.stencilMask(nt),oe=nt)},setFunc:function(nt,On,Cn){(fe!==nt||Me!==On||se!==Cn)&&(i.stencilFunc(nt,On,Cn),fe=nt,Me=On,se=Cn)},setOp:function(nt,On,Cn){(K!==nt||Ae!==On||Be!==Cn)&&(i.stencilOp(nt,On,Cn),K=nt,Ae=On,Be=Cn)},setLocked:function(nt){I=nt},setClear:function(nt){ct!==nt&&(i.clearStencil(nt),ct=nt)},reset:function(){I=!1,oe=null,fe=null,Me=null,se=null,K=null,Ae=null,Be=null,ct=null}}}let s=new t,a=new n,o=new r,l=new WeakMap,c=new WeakMap,h={},d={},u=new WeakMap,f=[],g=null,y=!1,m=null,p=null,E=null,w=null,v=null,R=null,C=null,L=new $e(0,0,0),D=0,M=!1,b=null,P=null,O=null,z=null,W=null,q=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,te=0,G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(G)[1]),V=te>=1):G.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),V=te>=2);let le=null,de={},ge=i.getParameter(i.SCISSOR_BOX),De=i.getParameter(i.VIEWPORT),Ye=new vt().fromArray(ge),Qe=new vt().fromArray(De);function Xe(I,oe,fe,Me){let se=new Uint8Array(4),K=i.createTexture();i.bindTexture(I,K),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ae=0;Ae<fe;Ae++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(oe,0,i.RGBA,1,1,Me,0,i.RGBA,i.UNSIGNED_BYTE,se):i.texImage2D(oe+Ae,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,se);return K}let Y={};Y[i.TEXTURE_2D]=Xe(i.TEXTURE_2D,i.TEXTURE_2D,1),Y[i.TEXTURE_CUBE_MAP]=Xe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[i.TEXTURE_2D_ARRAY]=Xe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Y[i.TEXTURE_3D]=Xe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ee(i.DEPTH_TEST),a.setFunc(Si),Z(!1),$(Pl),ee(i.CULL_FACE),Q($n);function ee(I){h[I]!==!0&&(i.enable(I),h[I]=!0)}function be(I){h[I]!==!1&&(i.disable(I),h[I]=!1)}function Pe(I,oe){return d[I]!==oe?(i.bindFramebuffer(I,oe),d[I]=oe,I===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=oe),I===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=oe),!0):!1}function Se(I,oe){let fe=f,Me=!1;if(I){fe=u.get(oe),fe===void 0&&(fe=[],u.set(oe,fe));let se=I.textures;if(fe.length!==se.length||fe[0]!==i.COLOR_ATTACHMENT0){for(let K=0,Ae=se.length;K<Ae;K++)fe[K]=i.COLOR_ATTACHMENT0+K;fe.length=se.length,Me=!0}}else fe[0]!==i.BACK&&(fe[0]=i.BACK,Me=!0);Me&&i.drawBuffers(fe)}function Ze(I){return g!==I?(i.useProgram(I),g=I,!0):!1}let lt={[si]:i.FUNC_ADD,[gh]:i.FUNC_SUBTRACT,[yh]:i.FUNC_REVERSE_SUBTRACT};lt[_h]=i.MIN,lt[vh]=i.MAX;let A={[xh]:i.ZERO,[bh]:i.ONE,[Mh]:i.SRC_COLOR,[ra]:i.SRC_ALPHA,[Ch]:i.SRC_ALPHA_SATURATE,[Th]:i.DST_COLOR,[Sh]:i.DST_ALPHA,[wh]:i.ONE_MINUS_SRC_COLOR,[sa]:i.ONE_MINUS_SRC_ALPHA,[Ah]:i.ONE_MINUS_DST_COLOR,[Eh]:i.ONE_MINUS_DST_ALPHA,[Rh]:i.CONSTANT_COLOR,[Ph]:i.ONE_MINUS_CONSTANT_COLOR,[Lh]:i.CONSTANT_ALPHA,[Ih]:i.ONE_MINUS_CONSTANT_ALPHA};function Q(I,oe,fe,Me,se,K,Ae,Be,ct,nt){if(I===$n){y===!0&&(be(i.BLEND),y=!1);return}if(y===!1&&(ee(i.BLEND),y=!0),I!==mh){if(I!==m||nt!==M){if((p!==si||v!==si)&&(i.blendEquation(i.FUNC_ADD),p=si,v=si),nt)switch(I){case wi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Il:i.blendFunc(i.ONE,i.ONE);break;case Dl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Nl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case wi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Il:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Dl:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Nl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}E=null,w=null,R=null,C=null,L.set(0,0,0),D=0,m=I,M=nt}return}se=se||oe,K=K||fe,Ae=Ae||Me,(oe!==p||se!==v)&&(i.blendEquationSeparate(lt[oe],lt[se]),p=oe,v=se),(fe!==E||Me!==w||K!==R||Ae!==C)&&(i.blendFuncSeparate(A[fe],A[Me],A[K],A[Ae]),E=fe,w=Me,R=K,C=Ae),(Be.equals(L)===!1||ct!==D)&&(i.blendColor(Be.r,Be.g,Be.b,ct),L.copy(Be),D=ct),m=I,M=!1}function J(I,oe){I.side===$t?be(i.CULL_FACE):ee(i.CULL_FACE);let fe=I.side===Gt;oe&&(fe=!fe),Z(fe),I.blending===wi&&I.transparent===!1?Q($n):Q(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),s.setMask(I.colorWrite);let Me=I.stencilWrite;o.setTest(Me),Me&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),ie(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):be(i.SAMPLE_ALPHA_TO_COVERAGE)}function Z(I){b!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),b=I)}function $(I){I!==ph?(ee(i.CULL_FACE),I!==P&&(I===Pl?i.cullFace(i.BACK):I===fh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):be(i.CULL_FACE),P=I}function ue(I){I!==O&&(V&&i.lineWidth(I),O=I)}function ie(I,oe,fe){I?(ee(i.POLYGON_OFFSET_FILL),(z!==oe||W!==fe)&&(i.polygonOffset(oe,fe),z=oe,W=fe)):be(i.POLYGON_OFFSET_FILL)}function pe(I){I?ee(i.SCISSOR_TEST):be(i.SCISSOR_TEST)}function ke(I){I===void 0&&(I=i.TEXTURE0+q-1),le!==I&&(i.activeTexture(I),le=I)}function Oe(I,oe,fe){fe===void 0&&(le===null?fe=i.TEXTURE0+q-1:fe=le);let Me=de[fe];Me===void 0&&(Me={type:void 0,texture:void 0},de[fe]=Me),(Me.type!==I||Me.texture!==oe)&&(le!==fe&&(i.activeTexture(fe),le=fe),i.bindTexture(I,oe||Y[I]),Me.type=I,Me.texture=oe)}function S(){let I=de[le];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function _(){try{i.compressedTexImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function F(){try{i.compressedTexImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function H(){try{i.texSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function j(){try{i.texSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function X(){try{i.compressedTexSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ce(){try{i.compressedTexSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function he(){try{i.texStorage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ee(){try{i.texStorage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Te(){try{i.texImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function re(){try{i.texImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ve(I){Ye.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),Ye.copy(I))}function Ue(I){Qe.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),Qe.copy(I))}function Re(I,oe){let fe=c.get(oe);fe===void 0&&(fe=new WeakMap,c.set(oe,fe));let Me=fe.get(I);Me===void 0&&(Me=i.getUniformBlockIndex(oe,I.name),fe.set(I,Me))}function ye(I,oe){let Me=c.get(oe).get(I);l.get(oe)!==Me&&(i.uniformBlockBinding(oe,Me,I.__bindingPointIndex),l.set(oe,Me))}function He(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},le=null,de={},d={},u=new WeakMap,f=[],g=null,y=!1,m=null,p=null,E=null,w=null,v=null,R=null,C=null,L=new $e(0,0,0),D=0,M=!1,b=null,P=null,O=null,z=null,W=null,Ye.set(0,0,i.canvas.width,i.canvas.height),Qe.set(0,0,i.canvas.width,i.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:ee,disable:be,bindFramebuffer:Pe,drawBuffers:Se,useProgram:Ze,setBlending:Q,setMaterial:J,setFlipSided:Z,setCullFace:$,setLineWidth:ue,setPolygonOffset:ie,setScissorTest:pe,activeTexture:ke,bindTexture:Oe,unbindTexture:S,compressedTexImage2D:_,compressedTexImage3D:F,texImage2D:Te,texImage3D:re,updateUBOMapping:Re,uniformBlockBinding:ye,texStorage2D:he,texStorage3D:Ee,texSubImage2D:H,texSubImage3D:j,compressedTexSubImage2D:X,compressedTexSubImage3D:Ce,scissor:ve,viewport:Ue,reset:He}}function sy(i,e,t,n,r,s,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ce,h=new WeakMap,d,u=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(S,_){return f?new OffscreenCanvas(S,_):Xr("canvas")}function y(S,_,F){let H=1,j=Oe(S);if((j.width>F||j.height>F)&&(H=F/Math.max(j.width,j.height)),H<1)if(typeof HTMLImageElement<"u"&&S instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&S instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&S instanceof ImageBitmap||typeof VideoFrame<"u"&&S instanceof VideoFrame){let X=Math.floor(H*j.width),Ce=Math.floor(H*j.height);d===void 0&&(d=g(X,Ce));let he=_?g(X,Ce):d;return he.width=X,he.height=Ce,he.getContext("2d").drawImage(S,0,0,X,Ce),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+X+"x"+Ce+")."),he}else return"data"in S&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),S;return S}function m(S){return S.generateMipmaps}function p(S){i.generateMipmap(S)}function E(S){return S.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:S.isWebGL3DRenderTarget?i.TEXTURE_3D:S.isWebGLArrayRenderTarget||S.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function w(S,_,F,H,j=!1){if(S!==null){if(i[S]!==void 0)return i[S];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+S+"'")}let X=_;if(_===i.RED&&(F===i.FLOAT&&(X=i.R32F),F===i.HALF_FLOAT&&(X=i.R16F),F===i.UNSIGNED_BYTE&&(X=i.R8)),_===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.R8UI),F===i.UNSIGNED_SHORT&&(X=i.R16UI),F===i.UNSIGNED_INT&&(X=i.R32UI),F===i.BYTE&&(X=i.R8I),F===i.SHORT&&(X=i.R16I),F===i.INT&&(X=i.R32I)),_===i.RG&&(F===i.FLOAT&&(X=i.RG32F),F===i.HALF_FLOAT&&(X=i.RG16F),F===i.UNSIGNED_BYTE&&(X=i.RG8)),_===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.RG8UI),F===i.UNSIGNED_SHORT&&(X=i.RG16UI),F===i.UNSIGNED_INT&&(X=i.RG32UI),F===i.BYTE&&(X=i.RG8I),F===i.SHORT&&(X=i.RG16I),F===i.INT&&(X=i.RG32I)),_===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.RGB8UI),F===i.UNSIGNED_SHORT&&(X=i.RGB16UI),F===i.UNSIGNED_INT&&(X=i.RGB32UI),F===i.BYTE&&(X=i.RGB8I),F===i.SHORT&&(X=i.RGB16I),F===i.INT&&(X=i.RGB32I)),_===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(X=i.RGBA16UI),F===i.UNSIGNED_INT&&(X=i.RGBA32UI),F===i.BYTE&&(X=i.RGBA8I),F===i.SHORT&&(X=i.RGBA16I),F===i.INT&&(X=i.RGBA32I)),_===i.RGB&&(F===i.UNSIGNED_INT_5_9_9_9_REV&&(X=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(X=i.R11F_G11F_B10F)),_===i.RGBA){let Ce=j?Gr:je.getTransfer(H);F===i.FLOAT&&(X=i.RGBA32F),F===i.HALF_FLOAT&&(X=i.RGBA16F),F===i.UNSIGNED_BYTE&&(X=Ce===it?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(X=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(X=i.RGB5_A1)}return(X===i.R16F||X===i.R32F||X===i.RG16F||X===i.RG32F||X===i.RGBA16F||X===i.RGBA32F)&&e.get("EXT_color_buffer_float"),X}function v(S,_){let F;return S?_===null||_===di||_===_r?F=i.DEPTH24_STENCIL8:_===Un?F=i.DEPTH32F_STENCIL8:_===gr&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===di||_===_r?F=i.DEPTH_COMPONENT24:_===Un?F=i.DEPTH_COMPONENT32F:_===gr&&(F=i.DEPTH_COMPONENT16),F}function R(S,_){return m(S)===!0||S.isFramebufferTexture&&S.minFilter!==un&&S.minFilter!==xn?Math.log2(Math.max(_.width,_.height))+1:S.mipmaps!==void 0&&S.mipmaps.length>0?S.mipmaps.length:S.isCompressedTexture&&Array.isArray(S.image)?_.mipmaps.length:1}function C(S){let _=S.target;_.removeEventListener("dispose",C),D(_),_.isVideoTexture&&h.delete(_)}function L(S){let _=S.target;_.removeEventListener("dispose",L),b(_)}function D(S){let _=n.get(S);if(_.__webglInit===void 0)return;let F=S.source,H=u.get(F);if(H){let j=H[_.__cacheKey];j.usedTimes--,j.usedTimes===0&&M(S),Object.keys(H).length===0&&u.delete(F)}n.remove(S)}function M(S){let _=n.get(S);i.deleteTexture(_.__webglTexture);let F=S.source,H=u.get(F);delete H[_.__cacheKey],a.memory.textures--}function b(S){let _=n.get(S);if(S.depthTexture&&(S.depthTexture.dispose(),n.remove(S.depthTexture)),S.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(_.__webglFramebuffer[H]))for(let j=0;j<_.__webglFramebuffer[H].length;j++)i.deleteFramebuffer(_.__webglFramebuffer[H][j]);else i.deleteFramebuffer(_.__webglFramebuffer[H]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[H])}else{if(Array.isArray(_.__webglFramebuffer))for(let H=0;H<_.__webglFramebuffer.length;H++)i.deleteFramebuffer(_.__webglFramebuffer[H]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let H=0;H<_.__webglColorRenderbuffer.length;H++)_.__webglColorRenderbuffer[H]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[H]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let F=S.textures;for(let H=0,j=F.length;H<j;H++){let X=n.get(F[H]);X.__webglTexture&&(i.deleteTexture(X.__webglTexture),a.memory.textures--),n.remove(F[H])}n.remove(S)}let P=0;function O(){P=0}function z(){let S=P;return S>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+S+" texture units while this GPU supports only "+r.maxTextures),P+=1,S}function W(S){let _=[];return _.push(S.wrapS),_.push(S.wrapT),_.push(S.wrapR||0),_.push(S.magFilter),_.push(S.minFilter),_.push(S.anisotropy),_.push(S.internalFormat),_.push(S.format),_.push(S.type),_.push(S.generateMipmaps),_.push(S.premultiplyAlpha),_.push(S.flipY),_.push(S.unpackAlignment),_.push(S.colorSpace),_.join()}function q(S,_){let F=n.get(S);if(S.isVideoTexture&&pe(S),S.isRenderTargetTexture===!1&&S.isExternalTexture!==!0&&S.version>0&&F.__version!==S.version){let H=S.image;if(H===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(F,S,_);return}}else S.isExternalTexture&&(F.__webglTexture=S.sourceTexture?S.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+_)}function V(S,_){let F=n.get(S);if(S.isRenderTargetTexture===!1&&S.version>0&&F.__version!==S.version){Y(F,S,_);return}t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+_)}function te(S,_){let F=n.get(S);if(S.isRenderTargetTexture===!1&&S.version>0&&F.__version!==S.version){Y(F,S,_);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+_)}function G(S,_){let F=n.get(S);if(S.version>0&&F.__version!==S.version){ee(F,S,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+_)}let le={[aa]:i.REPEAT,[ri]:i.CLAMP_TO_EDGE,[oa]:i.MIRRORED_REPEAT},de={[un]:i.NEAREST,[Hh]:i.NEAREST_MIPMAP_NEAREST,[vs]:i.NEAREST_MIPMAP_LINEAR,[xn]:i.LINEAR,[Xa]:i.LINEAR_MIPMAP_NEAREST,[hi]:i.LINEAR_MIPMAP_LINEAR},ge={[Xh]:i.NEVER,[Kh]:i.ALWAYS,[qh]:i.LESS,[ql]:i.LEQUAL,[Yh]:i.EQUAL,[Jh]:i.GEQUAL,[$h]:i.GREATER,[Zh]:i.NOTEQUAL};function De(S,_){if(_.type===Un&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===xn||_.magFilter===Xa||_.magFilter===vs||_.magFilter===hi||_.minFilter===xn||_.minFilter===Xa||_.minFilter===vs||_.minFilter===hi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(S,i.TEXTURE_WRAP_S,le[_.wrapS]),i.texParameteri(S,i.TEXTURE_WRAP_T,le[_.wrapT]),(S===i.TEXTURE_3D||S===i.TEXTURE_2D_ARRAY)&&i.texParameteri(S,i.TEXTURE_WRAP_R,le[_.wrapR]),i.texParameteri(S,i.TEXTURE_MAG_FILTER,de[_.magFilter]),i.texParameteri(S,i.TEXTURE_MIN_FILTER,de[_.minFilter]),_.compareFunction&&(i.texParameteri(S,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(S,i.TEXTURE_COMPARE_FUNC,ge[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===un||_.minFilter!==vs&&_.minFilter!==hi||_.type===Un&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(S,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,r.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function Ye(S,_){let F=!1;S.__webglInit===void 0&&(S.__webglInit=!0,_.addEventListener("dispose",C));let H=_.source,j=u.get(H);j===void 0&&(j={},u.set(H,j));let X=W(_);if(X!==S.__cacheKey){j[X]===void 0&&(j[X]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,F=!0),j[X].usedTimes++;let Ce=j[S.__cacheKey];Ce!==void 0&&(j[S.__cacheKey].usedTimes--,Ce.usedTimes===0&&M(_)),S.__cacheKey=X,S.__webglTexture=j[X].texture}return F}function Qe(S,_,F){return Math.floor(Math.floor(S/F)/_)}function Xe(S,_,F,H){let X=S.updateRanges;if(X.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,F,H,_.data);else{X.sort((re,ve)=>re.start-ve.start);let Ce=0;for(let re=1;re<X.length;re++){let ve=X[Ce],Ue=X[re],Re=ve.start+ve.count,ye=Qe(Ue.start,_.width,4),He=Qe(ve.start,_.width,4);Ue.start<=Re+1&&ye===He&&Qe(Ue.start+Ue.count-1,_.width,4)===ye?ve.count=Math.max(ve.count,Ue.start+Ue.count-ve.start):(++Ce,X[Ce]=Ue)}X.length=Ce+1;let he=i.getParameter(i.UNPACK_ROW_LENGTH),Ee=i.getParameter(i.UNPACK_SKIP_PIXELS),Te=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let re=0,ve=X.length;re<ve;re++){let Ue=X[re],Re=Math.floor(Ue.start/4),ye=Math.ceil(Ue.count/4),He=Re%_.width,I=Math.floor(Re/_.width),oe=ye,fe=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,He),i.pixelStorei(i.UNPACK_SKIP_ROWS,I),t.texSubImage2D(i.TEXTURE_2D,0,He,I,oe,fe,F,H,_.data)}S.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,he),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ee),i.pixelStorei(i.UNPACK_SKIP_ROWS,Te)}}function Y(S,_,F){let H=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(H=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(H=i.TEXTURE_3D);let j=Ye(S,_),X=_.source;t.bindTexture(H,S.__webglTexture,i.TEXTURE0+F);let Ce=n.get(X);if(X.version!==Ce.__version||j===!0){t.activeTexture(i.TEXTURE0+F);let he=je.getPrimaries(je.workingColorSpace),Ee=_.colorSpace===Jn?null:je.getPrimaries(_.colorSpace),Te=_.colorSpace===Jn||he===Ee?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);let re=y(_.image,!1,r.maxTextureSize);re=ke(_,re);let ve=s.convert(_.format,_.colorSpace),Ue=s.convert(_.type),Re=w(_.internalFormat,ve,Ue,_.colorSpace,_.isVideoTexture);De(H,_);let ye,He=_.mipmaps,I=_.isVideoTexture!==!0,oe=Ce.__version===void 0||j===!0,fe=X.dataReady,Me=R(_,re);if(_.isDepthTexture)Re=v(_.format===vr,_.type),oe&&(I?t.texStorage2D(i.TEXTURE_2D,1,Re,re.width,re.height):t.texImage2D(i.TEXTURE_2D,0,Re,re.width,re.height,0,ve,Ue,null));else if(_.isDataTexture)if(He.length>0){I&&oe&&t.texStorage2D(i.TEXTURE_2D,Me,Re,He[0].width,He[0].height);for(let se=0,K=He.length;se<K;se++)ye=He[se],I?fe&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,ye.width,ye.height,ve,Ue,ye.data):t.texImage2D(i.TEXTURE_2D,se,Re,ye.width,ye.height,0,ve,Ue,ye.data);_.generateMipmaps=!1}else I?(oe&&t.texStorage2D(i.TEXTURE_2D,Me,Re,re.width,re.height),fe&&Xe(_,re,ve,Ue)):t.texImage2D(i.TEXTURE_2D,0,Re,re.width,re.height,0,ve,Ue,re.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){I&&oe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Me,Re,He[0].width,He[0].height,re.depth);for(let se=0,K=He.length;se<K;se++)if(ye=He[se],_.format!==pn)if(ve!==null)if(I){if(fe)if(_.layerUpdates.size>0){let Ae=ec(ye.width,ye.height,_.format,_.type);for(let Be of _.layerUpdates){let ct=ye.data.subarray(Be*Ae/ye.data.BYTES_PER_ELEMENT,(Be+1)*Ae/ye.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,Be,ye.width,ye.height,1,ve,ct)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,ye.width,ye.height,re.depth,ve,ye.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,se,Re,ye.width,ye.height,re.depth,0,ye.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else I?fe&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,ye.width,ye.height,re.depth,ve,Ue,ye.data):t.texImage3D(i.TEXTURE_2D_ARRAY,se,Re,ye.width,ye.height,re.depth,0,ve,Ue,ye.data)}else{I&&oe&&t.texStorage2D(i.TEXTURE_2D,Me,Re,He[0].width,He[0].height);for(let se=0,K=He.length;se<K;se++)ye=He[se],_.format!==pn?ve!==null?I?fe&&t.compressedTexSubImage2D(i.TEXTURE_2D,se,0,0,ye.width,ye.height,ve,ye.data):t.compressedTexImage2D(i.TEXTURE_2D,se,Re,ye.width,ye.height,0,ye.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):I?fe&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,ye.width,ye.height,ve,Ue,ye.data):t.texImage2D(i.TEXTURE_2D,se,Re,ye.width,ye.height,0,ve,Ue,ye.data)}else if(_.isDataArrayTexture)if(I){if(oe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Me,Re,re.width,re.height,re.depth),fe)if(_.layerUpdates.size>0){let se=ec(re.width,re.height,_.format,_.type);for(let K of _.layerUpdates){let Ae=re.data.subarray(K*se/re.data.BYTES_PER_ELEMENT,(K+1)*se/re.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,K,re.width,re.height,1,ve,Ue,Ae)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,ve,Ue,re.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Re,re.width,re.height,re.depth,0,ve,Ue,re.data);else if(_.isData3DTexture)I?(oe&&t.texStorage3D(i.TEXTURE_3D,Me,Re,re.width,re.height,re.depth),fe&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,ve,Ue,re.data)):t.texImage3D(i.TEXTURE_3D,0,Re,re.width,re.height,re.depth,0,ve,Ue,re.data);else if(_.isFramebufferTexture){if(oe)if(I)t.texStorage2D(i.TEXTURE_2D,Me,Re,re.width,re.height);else{let se=re.width,K=re.height;for(let Ae=0;Ae<Me;Ae++)t.texImage2D(i.TEXTURE_2D,Ae,Re,se,K,0,ve,Ue,null),se>>=1,K>>=1}}else if(He.length>0){if(I&&oe){let se=Oe(He[0]);t.texStorage2D(i.TEXTURE_2D,Me,Re,se.width,se.height)}for(let se=0,K=He.length;se<K;se++)ye=He[se],I?fe&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,ve,Ue,ye):t.texImage2D(i.TEXTURE_2D,se,Re,ve,Ue,ye);_.generateMipmaps=!1}else if(I){if(oe){let se=Oe(re);t.texStorage2D(i.TEXTURE_2D,Me,Re,se.width,se.height)}fe&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ve,Ue,re)}else t.texImage2D(i.TEXTURE_2D,0,Re,ve,Ue,re);m(_)&&p(H),Ce.__version=X.version,_.onUpdate&&_.onUpdate(_)}S.__version=_.version}function ee(S,_,F){if(_.image.length!==6)return;let H=Ye(S,_),j=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,S.__webglTexture,i.TEXTURE0+F);let X=n.get(j);if(j.version!==X.__version||H===!0){t.activeTexture(i.TEXTURE0+F);let Ce=je.getPrimaries(je.workingColorSpace),he=_.colorSpace===Jn?null:je.getPrimaries(_.colorSpace),Ee=_.colorSpace===Jn||Ce===he?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);let Te=_.isCompressedTexture||_.image[0].isCompressedTexture,re=_.image[0]&&_.image[0].isDataTexture,ve=[];for(let K=0;K<6;K++)!Te&&!re?ve[K]=y(_.image[K],!0,r.maxCubemapSize):ve[K]=re?_.image[K].image:_.image[K],ve[K]=ke(_,ve[K]);let Ue=ve[0],Re=s.convert(_.format,_.colorSpace),ye=s.convert(_.type),He=w(_.internalFormat,Re,ye,_.colorSpace),I=_.isVideoTexture!==!0,oe=X.__version===void 0||H===!0,fe=j.dataReady,Me=R(_,Ue);De(i.TEXTURE_CUBE_MAP,_);let se;if(Te){I&&oe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Me,He,Ue.width,Ue.height);for(let K=0;K<6;K++){se=ve[K].mipmaps;for(let Ae=0;Ae<se.length;Ae++){let Be=se[Ae];_.format!==pn?Re!==null?I?fe&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,Ae,0,0,Be.width,Be.height,Re,Be.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,Ae,He,Be.width,Be.height,0,Be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,Ae,0,0,Be.width,Be.height,Re,ye,Be.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,Ae,He,Be.width,Be.height,0,Re,ye,Be.data)}}}else{if(se=_.mipmaps,I&&oe){se.length>0&&Me++;let K=Oe(ve[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Me,He,K.width,K.height)}for(let K=0;K<6;K++)if(re){I?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,ve[K].width,ve[K].height,Re,ye,ve[K].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,He,ve[K].width,ve[K].height,0,Re,ye,ve[K].data);for(let Ae=0;Ae<se.length;Ae++){let ct=se[Ae].image[K].image;I?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,Ae+1,0,0,ct.width,ct.height,Re,ye,ct.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,Ae+1,He,ct.width,ct.height,0,Re,ye,ct.data)}}else{I?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Re,ye,ve[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,He,Re,ye,ve[K]);for(let Ae=0;Ae<se.length;Ae++){let Be=se[Ae];I?fe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,Ae+1,0,0,Re,ye,Be.image[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,Ae+1,He,Re,ye,Be.image[K])}}}m(_)&&p(i.TEXTURE_CUBE_MAP),X.__version=j.version,_.onUpdate&&_.onUpdate(_)}S.__version=_.version}function be(S,_,F,H,j,X){let Ce=s.convert(F.format,F.colorSpace),he=s.convert(F.type),Ee=w(F.internalFormat,Ce,he,F.colorSpace),Te=n.get(_),re=n.get(F);if(re.__renderTarget=_,!Te.__hasExternalTextures){let ve=Math.max(1,_.width>>X),Ue=Math.max(1,_.height>>X);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?t.texImage3D(j,X,Ee,ve,Ue,_.depth,0,Ce,he,null):t.texImage2D(j,X,Ee,ve,Ue,0,Ce,he,null)}t.bindFramebuffer(i.FRAMEBUFFER,S),ie(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,H,j,re.__webglTexture,0,ue(_)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,H,j,re.__webglTexture,X),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Pe(S,_,F){if(i.bindRenderbuffer(i.RENDERBUFFER,S),_.depthBuffer){let H=_.depthTexture,j=H&&H.isDepthTexture?H.type:null,X=v(_.stencilBuffer,j),Ce=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,he=ue(_);ie(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,he,X,_.width,_.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,he,X,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,X,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ce,i.RENDERBUFFER,S)}else{let H=_.textures;for(let j=0;j<H.length;j++){let X=H[j],Ce=s.convert(X.format,X.colorSpace),he=s.convert(X.type),Ee=w(X.internalFormat,Ce,he,X.colorSpace),Te=ue(_);F&&ie(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Te,Ee,_.width,_.height):ie(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Te,Ee,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,Ee,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Se(S,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,S),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let H=n.get(_.depthTexture);H.__renderTarget=_,(!H.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),q(_.depthTexture,0);let j=H.__webglTexture,X=ue(_);if(_.depthTexture.format===sr)ie(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,X):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(_.depthTexture.format===vr)ie(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,X):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Ze(S){let _=n.get(S),F=S.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==S.depthTexture){let H=S.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),H){let j=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,H.removeEventListener("dispose",j)};H.addEventListener("dispose",j),_.__depthDisposeCallback=j}_.__boundDepthTexture=H}if(S.depthTexture&&!_.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");let H=S.texture.mipmaps;H&&H.length>0?Se(_.__webglFramebuffer[0],S):Se(_.__webglFramebuffer,S)}else if(F){_.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[H]),_.__webglDepthbuffer[H]===void 0)_.__webglDepthbuffer[H]=i.createRenderbuffer(),Pe(_.__webglDepthbuffer[H],S,!1);else{let j=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,X=_.__webglDepthbuffer[H];i.bindRenderbuffer(i.RENDERBUFFER,X),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,X)}}else{let H=S.texture.mipmaps;if(H&&H.length>0?t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),Pe(_.__webglDepthbuffer,S,!1);else{let j=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,X=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,X),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,X)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function lt(S,_,F){let H=n.get(S);_!==void 0&&be(H.__webglFramebuffer,S,S.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Ze(S)}function A(S){let _=S.texture,F=n.get(S),H=n.get(_);S.addEventListener("dispose",L);let j=S.textures,X=S.isWebGLCubeRenderTarget===!0,Ce=j.length>1;if(Ce||(H.__webglTexture===void 0&&(H.__webglTexture=i.createTexture()),H.__version=_.version,a.memory.textures++),X){F.__webglFramebuffer=[];for(let he=0;he<6;he++)if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer[he]=[];for(let Ee=0;Ee<_.mipmaps.length;Ee++)F.__webglFramebuffer[he][Ee]=i.createFramebuffer()}else F.__webglFramebuffer[he]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer=[];for(let he=0;he<_.mipmaps.length;he++)F.__webglFramebuffer[he]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(Ce)for(let he=0,Ee=j.length;he<Ee;he++){let Te=n.get(j[he]);Te.__webglTexture===void 0&&(Te.__webglTexture=i.createTexture(),a.memory.textures++)}if(S.samples>0&&ie(S)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let he=0;he<j.length;he++){let Ee=j[he];F.__webglColorRenderbuffer[he]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[he]);let Te=s.convert(Ee.format,Ee.colorSpace),re=s.convert(Ee.type),ve=w(Ee.internalFormat,Te,re,Ee.colorSpace,S.isXRRenderTarget===!0),Ue=ue(S);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ue,ve,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,F.__webglColorRenderbuffer[he])}i.bindRenderbuffer(i.RENDERBUFFER,null),S.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),Pe(F.__webglDepthRenderbuffer,S,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(X){t.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture),De(i.TEXTURE_CUBE_MAP,_);for(let he=0;he<6;he++)if(_.mipmaps&&_.mipmaps.length>0)for(let Ee=0;Ee<_.mipmaps.length;Ee++)be(F.__webglFramebuffer[he][Ee],S,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ee);else be(F.__webglFramebuffer[he],S,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+he,0);m(_)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ce){for(let he=0,Ee=j.length;he<Ee;he++){let Te=j[he],re=n.get(Te),ve=i.TEXTURE_2D;(S.isWebGL3DRenderTarget||S.isWebGLArrayRenderTarget)&&(ve=S.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ve,re.__webglTexture),De(ve,Te),be(F.__webglFramebuffer,S,Te,i.COLOR_ATTACHMENT0+he,ve,0),m(Te)&&p(ve)}t.unbindTexture()}else{let he=i.TEXTURE_2D;if((S.isWebGL3DRenderTarget||S.isWebGLArrayRenderTarget)&&(he=S.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(he,H.__webglTexture),De(he,_),_.mipmaps&&_.mipmaps.length>0)for(let Ee=0;Ee<_.mipmaps.length;Ee++)be(F.__webglFramebuffer[Ee],S,_,i.COLOR_ATTACHMENT0,he,Ee);else be(F.__webglFramebuffer,S,_,i.COLOR_ATTACHMENT0,he,0);m(_)&&p(he),t.unbindTexture()}S.depthBuffer&&Ze(S)}function Q(S){let _=S.textures;for(let F=0,H=_.length;F<H;F++){let j=_[F];if(m(j)){let X=E(S),Ce=n.get(j).__webglTexture;t.bindTexture(X,Ce),p(X),t.unbindTexture()}}}let J=[],Z=[];function $(S){if(S.samples>0){if(ie(S)===!1){let _=S.textures,F=S.width,H=S.height,j=i.COLOR_BUFFER_BIT,X=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ce=n.get(S),he=_.length>1;if(he)for(let Te=0;Te<_.length;Te++)t.bindFramebuffer(i.FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Te,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Te,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ce.__webglMultisampledFramebuffer);let Ee=S.texture.mipmaps;Ee&&Ee.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ce.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ce.__webglFramebuffer);for(let Te=0;Te<_.length;Te++){if(S.resolveDepthBuffer&&(S.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),S.stencilBuffer&&S.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),he){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ce.__webglColorRenderbuffer[Te]);let re=n.get(_[Te]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,re,0)}i.blitFramebuffer(0,0,F,H,0,0,F,H,j,i.NEAREST),l===!0&&(J.length=0,Z.length=0,J.push(i.COLOR_ATTACHMENT0+Te),S.depthBuffer&&S.resolveDepthBuffer===!1&&(J.push(X),Z.push(X),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Z)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,J))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),he)for(let Te=0;Te<_.length;Te++){t.bindFramebuffer(i.FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Te,i.RENDERBUFFER,Ce.__webglColorRenderbuffer[Te]);let re=n.get(_[Te]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Te,i.TEXTURE_2D,re,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ce.__webglMultisampledFramebuffer)}else if(S.depthBuffer&&S.resolveDepthBuffer===!1&&l){let _=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function ue(S){return Math.min(r.maxSamples,S.samples)}function ie(S){let _=n.get(S);return S.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function pe(S){let _=a.render.frame;h.get(S)!==_&&(h.set(S,_),S.update())}function ke(S,_){let F=S.colorSpace,H=S.format,j=S.type;return S.isCompressedTexture===!0||S.isVideoTexture===!0||F!==Ei&&F!==Jn&&(je.getTransfer(F)===it?(H!==pn||j!==Tn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),_}function Oe(S){return typeof HTMLImageElement<"u"&&S instanceof HTMLImageElement?(c.width=S.naturalWidth||S.width,c.height=S.naturalHeight||S.height):typeof VideoFrame<"u"&&S instanceof VideoFrame?(c.width=S.displayWidth,c.height=S.displayHeight):(c.width=S.width,c.height=S.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=O,this.setTexture2D=q,this.setTexture2DArray=V,this.setTexture3D=te,this.setTextureCube=G,this.rebindTextures=lt,this.setupRenderTarget=A,this.updateRenderTargetMipmap=Q,this.updateMultisampleRenderTarget=$,this.setupDepthRenderbuffer=Ze,this.setupFrameBufferTexture=be,this.useMultisampledRTT=ie}function ay(i,e){function t(n,r=Jn){let s,a=je.getTransfer(r);if(n===Tn)return i.UNSIGNED_BYTE;if(n===Ya)return i.UNSIGNED_SHORT_4_4_4_4;if(n===$a)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Bl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===zl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Ol)return i.BYTE;if(n===kl)return i.SHORT;if(n===gr)return i.UNSIGNED_SHORT;if(n===qa)return i.INT;if(n===di)return i.UNSIGNED_INT;if(n===Un)return i.FLOAT;if(n===yr)return i.HALF_FLOAT;if(n===Hl)return i.ALPHA;if(n===Vl)return i.RGB;if(n===pn)return i.RGBA;if(n===sr)return i.DEPTH_COMPONENT;if(n===vr)return i.DEPTH_STENCIL;if(n===Gl)return i.RED;if(n===Za)return i.RED_INTEGER;if(n===Wl)return i.RG;if(n===Ja)return i.RG_INTEGER;if(n===Ka)return i.RGBA_INTEGER;if(n===xs||n===bs||n===Ms||n===ws)if(a===it)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===xs)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===bs)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ms)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ws)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===xs)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===bs)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ms)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ws)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ja||n===Qa||n===eo||n===to)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===ja)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Qa)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===eo)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===to)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===no||n===io||n===ro)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===no||n===io)return a===it?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===ro)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===so||n===ao||n===oo||n===lo||n===co||n===ho||n===uo||n===po||n===fo||n===mo||n===go||n===yo||n===_o||n===vo)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===so)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ao)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===oo)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===lo)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===co)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ho)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===uo)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===po)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===fo)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===mo)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===go)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===yo)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===_o)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===vo)return a===it?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===xo||n===bo||n===Mo)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===xo)return a===it?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===bo)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Mo)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===wo||n===So||n===Eo||n===To)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===wo)return s.COMPRESSED_RED_RGTC1_EXT;if(n===So)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Eo)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===To)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===_r?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var oy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ly=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,pc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ts(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Mn({vertexShader:oy,fragmentShader:ly,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Mt(new Pi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},fc=class extends Rn{constructor(e,t){super();let n=this,r=null,s=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,g=null,y=typeof XRWebGLBinding<"u",m=new pc,p={},E=t.getContextAttributes(),w=null,v=null,R=[],C=[],L=new ce,D=null,M=new kt;M.viewport=new vt;let b=new kt;b.viewport=new vt;let P=[M,b],O=new Da,z=null,W=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ee=R[Y];return ee===void 0&&(ee=new cr,R[Y]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(Y){let ee=R[Y];return ee===void 0&&(ee=new cr,R[Y]=ee),ee.getGripSpace()},this.getHand=function(Y){let ee=R[Y];return ee===void 0&&(ee=new cr,R[Y]=ee),ee.getHandSpace()};function q(Y){let ee=C.indexOf(Y.inputSource);if(ee===-1)return;let be=R[ee];be!==void 0&&(be.update(Y.inputSource,Y.frame,c||a),be.dispatchEvent({type:Y.type,data:Y.inputSource}))}function V(){r.removeEventListener("select",q),r.removeEventListener("selectstart",q),r.removeEventListener("selectend",q),r.removeEventListener("squeeze",q),r.removeEventListener("squeezestart",q),r.removeEventListener("squeezeend",q),r.removeEventListener("end",V),r.removeEventListener("inputsourceschange",te);for(let Y=0;Y<R.length;Y++){let ee=C[Y];ee!==null&&(C[Y]=null,R[Y].disconnect(ee))}z=null,W=null,m.reset();for(let Y in p)delete p[Y];e.setRenderTarget(w),f=null,u=null,d=null,r=null,v=null,Xe.stop(),n.isPresenting=!1,e.setPixelRatio(D),e.setSize(L.width,L.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){s=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(Y){if(r=Y,r!==null){if(w=e.getRenderTarget(),r.addEventListener("select",q),r.addEventListener("selectstart",q),r.addEventListener("selectend",q),r.addEventListener("squeeze",q),r.addEventListener("squeezestart",q),r.addEventListener("squeezeend",q),r.addEventListener("end",V),r.addEventListener("inputsourceschange",te),E.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(L),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let be=null,Pe=null,Se=null;E.depth&&(Se=E.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,be=E.stencil?vr:sr,Pe=E.stencil?_r:di);let Ze={colorFormat:t.RGBA8,depthFormat:Se,scaleFactor:s};d=this.getBinding(),u=d.createProjectionLayer(Ze),r.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),v=new Pn(u.textureWidth,u.textureHeight,{format:pn,type:Tn,depthTexture:new es(u.textureWidth,u.textureHeight,Pe,void 0,void 0,void 0,void 0,void 0,void 0,be),stencilBuffer:E.stencil,colorSpace:e.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{let be={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,be),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new Pn(f.framebufferWidth,f.framebufferHeight,{format:pn,type:Tn,colorSpace:e.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(o),Xe.setContext(r),Xe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function te(Y){for(let ee=0;ee<Y.removed.length;ee++){let be=Y.removed[ee],Pe=C.indexOf(be);Pe>=0&&(C[Pe]=null,R[Pe].disconnect(be))}for(let ee=0;ee<Y.added.length;ee++){let be=Y.added[ee],Pe=C.indexOf(be);if(Pe===-1){for(let Ze=0;Ze<R.length;Ze++)if(Ze>=C.length){C.push(be),Pe=Ze;break}else if(C[Ze]===null){C[Ze]=be,Pe=Ze;break}if(Pe===-1)break}let Se=R[Pe];Se&&Se.connect(be)}}let G=new T,le=new T;function de(Y,ee,be){G.setFromMatrixPosition(ee.matrixWorld),le.setFromMatrixPosition(be.matrixWorld);let Pe=G.distanceTo(le),Se=ee.projectionMatrix.elements,Ze=be.projectionMatrix.elements,lt=Se[14]/(Se[10]-1),A=Se[14]/(Se[10]+1),Q=(Se[9]+1)/Se[5],J=(Se[9]-1)/Se[5],Z=(Se[8]-1)/Se[0],$=(Ze[8]+1)/Ze[0],ue=lt*Z,ie=lt*$,pe=Pe/(-Z+$),ke=pe*-Z;if(ee.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(ke),Y.translateZ(pe),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Se[10]===-1)Y.projectionMatrix.copy(ee.projectionMatrix),Y.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let Oe=lt+pe,S=A+pe,_=ue-ke,F=ie+(Pe-ke),H=Q*A/S*Oe,j=J*A/S*Oe;Y.projectionMatrix.makePerspective(_,F,H,j,Oe,S),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ge(Y,ee){ee===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ee.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(r===null)return;let ee=Y.near,be=Y.far;m.texture!==null&&(m.depthNear>0&&(ee=m.depthNear),m.depthFar>0&&(be=m.depthFar)),O.near=b.near=M.near=ee,O.far=b.far=M.far=be,(z!==O.near||W!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),z=O.near,W=O.far),O.layers.mask=Y.layers.mask|6,M.layers.mask=O.layers.mask&3,b.layers.mask=O.layers.mask&5;let Pe=Y.parent,Se=O.cameras;ge(O,Pe);for(let Ze=0;Ze<Se.length;Ze++)ge(Se[Ze],Pe);Se.length===2?de(O,M,b):O.projectionMatrix.copy(M.projectionMatrix),De(Y,O,Pe)};function De(Y,ee,be){be===null?Y.matrix.copy(ee.matrixWorld):(Y.matrix.copy(be.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ee.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ee.projectionMatrix),Y.projectionMatrixInverse.copy(ee.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=ar*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(Y){l=Y,u!==null&&(u.fixedFoveation=Y),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Y)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(Y){return p[Y]};let Ye=null;function Qe(Y,ee){if(h=ee.getViewerPose(c||a),g=ee,h!==null){let be=h.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let Pe=!1;be.length!==O.cameras.length&&(O.cameras.length=0,Pe=!0);for(let A=0;A<be.length;A++){let Q=be[A],J=null;if(f!==null)J=f.getViewport(Q);else{let $=d.getViewSubImage(u,Q);J=$.viewport,A===0&&(e.setRenderTargetTextures(v,$.colorTexture,$.depthStencilTexture),e.setRenderTarget(v))}let Z=P[A];Z===void 0&&(Z=new kt,Z.layers.enable(A),Z.viewport=new vt,P[A]=Z),Z.matrix.fromArray(Q.transform.matrix),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.projectionMatrix.fromArray(Q.projectionMatrix),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert(),Z.viewport.set(J.x,J.y,J.width,J.height),A===0&&(O.matrix.copy(Z.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),Pe===!0&&O.cameras.push(Z)}let Se=r.enabledFeatures;if(Se&&Se.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&y){d=n.getBinding();let A=d.getDepthInformation(be[0]);A&&A.isValid&&A.texture&&m.init(A,r.renderState)}if(Se&&Se.includes("camera-access")&&y){e.state.unbindTexture(),d=n.getBinding();for(let A=0;A<be.length;A++){let Q=be[A].camera;if(Q){let J=p[Q];J||(J=new ts,p[Q]=J);let Z=d.getCameraImage(Q);J.sourceTexture=Z}}}}for(let be=0;be<R.length;be++){let Pe=C[be],Se=R[be];Pe!==null&&Se!==void 0&&Se.update(Pe,ee,c||a)}Ye&&Ye(Y,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}let Xe=new Pd;Xe.setAnimationLoop(Qe),this.setAnimationLoop=function(Y){Ye=Y},this.dispose=function(){}}},Oi=new bn,cy=new ft;function hy(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Jl(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function r(m,p,E,w,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),d(m,p)):p.isMeshPhongMaterial?(s(m,p),h(m,p)):p.isMeshStandardMaterial?(s(m,p),u(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),y(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,E,w):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Gt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Gt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let E=e.get(p),w=E.envMap,v=E.envMapRotation;w&&(m.envMap.value=w,Oi.copy(v),Oi.x*=-1,Oi.y*=-1,Oi.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Oi.y*=-1,Oi.z*=-1),m.envMapRotation.value.setFromMatrix4(cy.makeRotationFromEuler(Oi)),m.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,E,w){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*E,m.scale.value=w*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,E){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Gt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function y(m,p){let E=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function dy(i,e,t,n){let r={},s={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(E,w){let v=w.program;n.uniformBlockBinding(E,v)}function c(E,w){let v=r[E.id];v===void 0&&(g(E),v=h(E),r[E.id]=v,E.addEventListener("dispose",m));let R=w.program;n.updateUBOMapping(E,R);let C=e.render.frame;s[E.id]!==C&&(u(E),s[E.id]=C)}function h(E){let w=d();E.__bindingPointIndex=w;let v=i.createBuffer(),R=E.__size,C=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,R,C),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,w,v),v}function d(){for(let E=0;E<o;E++)if(a.indexOf(E)===-1)return a.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(E){let w=r[E.id],v=E.uniforms,R=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let C=0,L=v.length;C<L;C++){let D=Array.isArray(v[C])?v[C]:[v[C]];for(let M=0,b=D.length;M<b;M++){let P=D[M];if(f(P,C,M,R)===!0){let O=P.__offset,z=Array.isArray(P.value)?P.value:[P.value],W=0;for(let q=0;q<z.length;q++){let V=z[q],te=y(V);typeof V=="number"||typeof V=="boolean"?(P.__data[0]=V,i.bufferSubData(i.UNIFORM_BUFFER,O+W,P.__data)):V.isMatrix3?(P.__data[0]=V.elements[0],P.__data[1]=V.elements[1],P.__data[2]=V.elements[2],P.__data[3]=0,P.__data[4]=V.elements[3],P.__data[5]=V.elements[4],P.__data[6]=V.elements[5],P.__data[7]=0,P.__data[8]=V.elements[6],P.__data[9]=V.elements[7],P.__data[10]=V.elements[8],P.__data[11]=0):(V.toArray(P.__data,W),W+=te.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,O,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(E,w,v,R){let C=E.value,L=w+"_"+v;if(R[L]===void 0)return typeof C=="number"||typeof C=="boolean"?R[L]=C:R[L]=C.clone(),!0;{let D=R[L];if(typeof C=="number"||typeof C=="boolean"){if(D!==C)return R[L]=C,!0}else if(D.equals(C)===!1)return D.copy(C),!0}return!1}function g(E){let w=E.uniforms,v=0,R=16;for(let L=0,D=w.length;L<D;L++){let M=Array.isArray(w[L])?w[L]:[w[L]];for(let b=0,P=M.length;b<P;b++){let O=M[b],z=Array.isArray(O.value)?O.value:[O.value];for(let W=0,q=z.length;W<q;W++){let V=z[W],te=y(V),G=v%R,le=G%te.boundary,de=G+le;v+=le,de!==0&&R-de<te.storage&&(v+=R-de),O.__data=new Float32Array(te.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=v,v+=te.storage}}}let C=v%R;return C>0&&(v+=R-C),E.__size=v,E.__cache={},this}function y(E){let w={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(w.boundary=4,w.storage=4):E.isVector2?(w.boundary=8,w.storage=8):E.isVector3||E.isColor?(w.boundary=16,w.storage=12):E.isVector4?(w.boundary=16,w.storage=16):E.isMatrix3?(w.boundary=48,w.storage=48):E.isMatrix4?(w.boundary=64,w.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),w}function m(E){let w=E.target;w.removeEventListener("dispose",m);let v=a.indexOf(w.__bindingPointIndex);a.splice(v,1),i.deleteBuffer(r[w.id]),delete r[w.id],delete s[w.id]}function p(){for(let E in r)i.deleteBuffer(r[E]);a=[],r={},s={}}return{bind:l,update:c,dispose:p}}var Lo=class{constructor(e={}){let{canvas:t=jh(),context:n=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;let g=new Uint32Array(4),y=new Int32Array(4),m=null,p=null,E=[],w=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Zn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let v=this,R=!1;this._outputColorSpace=Vt;let C=0,L=0,D=null,M=-1,b=null,P=new vt,O=new vt,z=null,W=new $e(0),q=0,V=t.width,te=t.height,G=1,le=null,de=null,ge=new vt(0,0,V,te),De=new vt(0,0,V,te),Ye=!1,Qe=new hr,Xe=!1,Y=!1,ee=new ft,be=new T,Pe=new vt,Se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ze=!1;function lt(){return D===null?G:1}let A=n;function Q(x,N){return t.getContext(x,N)}try{let x={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",fe,!1),t.addEventListener("webglcontextrestored",Me,!1),t.addEventListener("webglcontextcreationerror",se,!1),A===null){let N="webgl2";if(A=Q(N,x),A===null)throw Q(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(x){throw console.error("THREE.WebGLRenderer: "+x.message),x}let J,Z,$,ue,ie,pe,ke,Oe,S,_,F,H,j,X,Ce,he,Ee,Te,re,ve,Ue,Re,ye,He;function I(){J=new R0(A),J.init(),Re=new ay(A,J),Z=new M0(A,J,e,Re),$=new ry(A,J),Z.reversedDepthBuffer&&u&&$.buffers.depth.setReversed(!0),ue=new I0(A),ie=new Xg,pe=new sy(A,J,$,ie,Z,Re,ue),ke=new S0(v),Oe=new C0(v),S=new Op(A),ye=new x0(A,S),_=new P0(A,S,ue,ye),F=new N0(A,_,S,ue),re=new D0(A,Z,pe),he=new w0(ie),H=new Wg(v,ke,Oe,J,Z,ye,he),j=new hy(v,ie),X=new Yg,Ce=new Qg(J),Te=new v0(v,ke,Oe,$,F,f,l),Ee=new ny(v,F,Z),He=new dy(A,ue,Z,$),ve=new b0(A,J,ue),Ue=new L0(A,J,ue),ue.programs=H.programs,v.capabilities=Z,v.extensions=J,v.properties=ie,v.renderLists=X,v.shadowMap=Ee,v.state=$,v.info=ue}I();let oe=new fc(v,A);this.xr=oe,this.getContext=function(){return A},this.getContextAttributes=function(){return A.getContextAttributes()},this.forceContextLoss=function(){let x=J.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){let x=J.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(x){x!==void 0&&(G=x,this.setSize(V,te,!1))},this.getSize=function(x){return x.set(V,te)},this.setSize=function(x,N,k=!0){if(oe.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=x,te=N,t.width=Math.floor(x*G),t.height=Math.floor(N*G),k===!0&&(t.style.width=x+"px",t.style.height=N+"px"),this.setViewport(0,0,x,N)},this.getDrawingBufferSize=function(x){return x.set(V*G,te*G).floor()},this.setDrawingBufferSize=function(x,N,k){V=x,te=N,G=k,t.width=Math.floor(x*k),t.height=Math.floor(N*k),this.setViewport(0,0,x,N)},this.getCurrentViewport=function(x){return x.copy(P)},this.getViewport=function(x){return x.copy(ge)},this.setViewport=function(x,N,k,B){x.isVector4?ge.set(x.x,x.y,x.z,x.w):ge.set(x,N,k,B),$.viewport(P.copy(ge).multiplyScalar(G).round())},this.getScissor=function(x){return x.copy(De)},this.setScissor=function(x,N,k,B){x.isVector4?De.set(x.x,x.y,x.z,x.w):De.set(x,N,k,B),$.scissor(O.copy(De).multiplyScalar(G).round())},this.getScissorTest=function(){return Ye},this.setScissorTest=function(x){$.setScissorTest(Ye=x)},this.setOpaqueSort=function(x){le=x},this.setTransparentSort=function(x){de=x},this.getClearColor=function(x){return x.copy(Te.getClearColor())},this.setClearColor=function(){Te.setClearColor(...arguments)},this.getClearAlpha=function(){return Te.getClearAlpha()},this.setClearAlpha=function(){Te.setClearAlpha(...arguments)},this.clear=function(x=!0,N=!0,k=!0){let B=0;if(x){let U=!1;if(D!==null){let ae=D.texture.format;U=ae===Ka||ae===Ja||ae===Za}if(U){let ae=D.texture.type,_e=ae===Tn||ae===di||ae===gr||ae===_r||ae===Ya||ae===$a,we=Te.getClearColor(),xe=Te.getClearAlpha(),Ne=we.r,Fe=we.g,Le=we.b;_e?(g[0]=Ne,g[1]=Fe,g[2]=Le,g[3]=xe,A.clearBufferuiv(A.COLOR,0,g)):(y[0]=Ne,y[1]=Fe,y[2]=Le,y[3]=xe,A.clearBufferiv(A.COLOR,0,y))}else B|=A.COLOR_BUFFER_BIT}N&&(B|=A.DEPTH_BUFFER_BIT),k&&(B|=A.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),A.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",fe,!1),t.removeEventListener("webglcontextrestored",Me,!1),t.removeEventListener("webglcontextcreationerror",se,!1),Te.dispose(),X.dispose(),Ce.dispose(),ie.dispose(),ke.dispose(),Oe.dispose(),F.dispose(),ye.dispose(),He.dispose(),H.dispose(),oe.dispose(),oe.removeEventListener("sessionstart",Cn),oe.removeEventListener("sessionend",Dc),mi.stop()};function fe(x){x.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function Me(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;let x=ue.autoReset,N=Ee.enabled,k=Ee.autoUpdate,B=Ee.needsUpdate,U=Ee.type;I(),ue.autoReset=x,Ee.enabled=N,Ee.autoUpdate=k,Ee.needsUpdate=B,Ee.type=U}function se(x){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function K(x){let N=x.target;N.removeEventListener("dispose",K),Ae(N)}function Ae(x){Be(x),ie.remove(x)}function Be(x){let N=ie.get(x).programs;N!==void 0&&(N.forEach(function(k){H.releaseProgram(k)}),x.isShaderMaterial&&H.releaseShaderCache(x))}this.renderBufferDirect=function(x,N,k,B,U,ae){N===null&&(N=Se);let _e=U.isMesh&&U.matrixWorld.determinant()<0,we=du(x,N,k,B,U);$.setMaterial(B,_e);let xe=k.index,Ne=1;if(B.wireframe===!0){if(xe=_.getWireframeAttribute(k),xe===void 0)return;Ne=2}let Fe=k.drawRange,Le=k.attributes.position,Je=Fe.start*Ne,rt=(Fe.start+Fe.count)*Ne;ae!==null&&(Je=Math.max(Je,ae.start*Ne),rt=Math.min(rt,(ae.start+ae.count)*Ne)),xe!==null?(Je=Math.max(Je,0),rt=Math.min(rt,xe.count)):Le!=null&&(Je=Math.max(Je,0),rt=Math.min(rt,Le.count));let bt=rt-Je;if(bt<0||bt===1/0)return;ye.setup(U,B,we,k,xe);let dt,at=ve;if(xe!==null&&(dt=S.get(xe),at=Ue,at.setIndex(dt)),U.isMesh)B.wireframe===!0?($.setLineWidth(B.wireframeLinewidth*lt()),at.setMode(A.LINES)):at.setMode(A.TRIANGLES);else if(U.isLine){let Ie=B.linewidth;Ie===void 0&&(Ie=1),$.setLineWidth(Ie*lt()),U.isLineSegments?at.setMode(A.LINES):U.isLineLoop?at.setMode(A.LINE_LOOP):at.setMode(A.LINE_STRIP)}else U.isPoints?at.setMode(A.POINTS):U.isSprite&&at.setMode(A.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)or("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),at.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(J.get("WEBGL_multi_draw"))at.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{let Ie=U._multiDrawStarts,gt=U._multiDrawCounts,et=U._multiDrawCount,jt=xe?S.get(xe).bytesPerElement:1,Gi=ie.get(B).currentProgram.getUniforms();for(let Qt=0;Qt<et;Qt++)Gi.setValue(A,"_gl_DrawID",Qt),at.render(Ie[Qt]/jt,gt[Qt])}else if(U.isInstancedMesh)at.renderInstances(Je,bt,U.count);else if(k.isInstancedBufferGeometry){let Ie=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,gt=Math.min(k.instanceCount,Ie);at.renderInstances(Je,bt,gt)}else at.render(Je,bt)};function ct(x,N,k){x.transparent===!0&&x.side===$t&&x.forceSinglePass===!1?(x.side=Gt,x.needsUpdate=!0,Ps(x,N,k),x.side=Xn,x.needsUpdate=!0,Ps(x,N,k),x.side=$t):Ps(x,N,k)}this.compile=function(x,N,k=null){k===null&&(k=x),p=Ce.get(k),p.init(N),w.push(p),k.traverseVisible(function(U){U.isLight&&U.layers.test(N.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),x!==k&&x.traverseVisible(function(U){U.isLight&&U.layers.test(N.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),p.setupLights();let B=new Set;return x.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let ae=U.material;if(ae)if(Array.isArray(ae))for(let _e=0;_e<ae.length;_e++){let we=ae[_e];ct(we,k,U),B.add(we)}else ct(ae,k,U),B.add(ae)}),p=w.pop(),B},this.compileAsync=function(x,N,k=null){let B=this.compile(x,N,k);return new Promise(U=>{function ae(){if(B.forEach(function(_e){ie.get(_e).currentProgram.isReady()&&B.delete(_e)}),B.size===0){U(x);return}setTimeout(ae,10)}J.get("KHR_parallel_shader_compile")!==null?ae():setTimeout(ae,10)})};let nt=null;function On(x){nt&&nt(x)}function Cn(){mi.stop()}function Dc(){mi.start()}let mi=new Pd;mi.setAnimationLoop(On),typeof self<"u"&&mi.setContext(self),this.setAnimationLoop=function(x){nt=x,oe.setAnimationLoop(x),x===null?mi.stop():mi.start()},oe.addEventListener("sessionstart",Cn),oe.addEventListener("sessionend",Dc),this.render=function(x,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),oe.enabled===!0&&oe.isPresenting===!0&&(oe.cameraAutoUpdate===!0&&oe.updateCamera(N),N=oe.getCamera()),x.isScene===!0&&x.onBeforeRender(v,x,N,D),p=Ce.get(x,w.length),p.init(N),w.push(p),ee.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Qe.setFromProjectionMatrix(ee,vn,N.reversedDepth),Y=this.localClippingEnabled,Xe=he.init(this.clippingPlanes,Y),m=X.get(x,E.length),m.init(),E.push(m),oe.enabled===!0&&oe.isPresenting===!0){let ae=v.xr.getDepthSensingMesh();ae!==null&&Go(ae,N,-1/0,v.sortObjects)}Go(x,N,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(le,de),Ze=oe.enabled===!1||oe.isPresenting===!1||oe.hasDepthSensing()===!1,Ze&&Te.addToRenderList(m,x),this.info.render.frame++,Xe===!0&&he.beginShadows();let k=p.state.shadowsArray;Ee.render(k,x,N),Xe===!0&&he.endShadows(),this.info.autoReset===!0&&this.info.reset();let B=m.opaque,U=m.transmissive;if(p.setupLights(),N.isArrayCamera){let ae=N.cameras;if(U.length>0)for(let _e=0,we=ae.length;_e<we;_e++){let xe=ae[_e];Uc(B,U,x,xe)}Ze&&Te.render(x);for(let _e=0,we=ae.length;_e<we;_e++){let xe=ae[_e];Nc(m,x,xe,xe.viewport)}}else U.length>0&&Uc(B,U,x,N),Ze&&Te.render(x),Nc(m,x,N);D!==null&&L===0&&(pe.updateMultisampleRenderTarget(D),pe.updateRenderTargetMipmap(D)),x.isScene===!0&&x.onAfterRender(v,x,N),ye.resetDefaultState(),M=-1,b=null,w.pop(),w.length>0?(p=w[w.length-1],Xe===!0&&he.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function Go(x,N,k,B){if(x.visible===!1)return;if(x.layers.test(N.layers)){if(x.isGroup)k=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(N);else if(x.isLight)p.pushLight(x),x.castShadow&&p.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||Qe.intersectsSprite(x)){B&&Pe.setFromMatrixPosition(x.matrixWorld).applyMatrix4(ee);let _e=F.update(x),we=x.material;we.visible&&m.push(x,_e,we,k,Pe.z,null)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||Qe.intersectsObject(x))){let _e=F.update(x),we=x.material;if(B&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),Pe.copy(x.boundingSphere.center)):(_e.boundingSphere===null&&_e.computeBoundingSphere(),Pe.copy(_e.boundingSphere.center)),Pe.applyMatrix4(x.matrixWorld).applyMatrix4(ee)),Array.isArray(we)){let xe=_e.groups;for(let Ne=0,Fe=xe.length;Ne<Fe;Ne++){let Le=xe[Ne],Je=we[Le.materialIndex];Je&&Je.visible&&m.push(x,_e,Je,k,Pe.z,Le)}}else we.visible&&m.push(x,_e,we,k,Pe.z,null)}}let ae=x.children;for(let _e=0,we=ae.length;_e<we;_e++)Go(ae[_e],N,k,B)}function Nc(x,N,k,B){let U=x.opaque,ae=x.transmissive,_e=x.transparent;p.setupLightsView(k),Xe===!0&&he.setGlobalState(v.clippingPlanes,k),B&&$.viewport(P.copy(B)),U.length>0&&Rs(U,N,k),ae.length>0&&Rs(ae,N,k),_e.length>0&&Rs(_e,N,k),$.buffers.depth.setTest(!0),$.buffers.depth.setMask(!0),$.buffers.color.setMask(!0),$.setPolygonOffset(!1)}function Uc(x,N,k,B){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[B.id]===void 0&&(p.state.transmissionRenderTarget[B.id]=new Pn(1,1,{generateMipmaps:!0,type:J.has("EXT_color_buffer_half_float")||J.has("EXT_color_buffer_float")?yr:Tn,minFilter:hi,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:je.workingColorSpace}));let ae=p.state.transmissionRenderTarget[B.id],_e=B.viewport||P;ae.setSize(_e.z*v.transmissionResolutionScale,_e.w*v.transmissionResolutionScale);let we=v.getRenderTarget(),xe=v.getActiveCubeFace(),Ne=v.getActiveMipmapLevel();v.setRenderTarget(ae),v.getClearColor(W),q=v.getClearAlpha(),q<1&&v.setClearColor(16777215,.5),v.clear(),Ze&&Te.render(k);let Fe=v.toneMapping;v.toneMapping=Zn;let Le=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),p.setupLightsView(B),Xe===!0&&he.setGlobalState(v.clippingPlanes,B),Rs(x,k,B),pe.updateMultisampleRenderTarget(ae),pe.updateRenderTargetMipmap(ae),J.has("WEBGL_multisampled_render_to_texture")===!1){let Je=!1;for(let rt=0,bt=N.length;rt<bt;rt++){let dt=N[rt],at=dt.object,Ie=dt.geometry,gt=dt.material,et=dt.group;if(gt.side===$t&&at.layers.test(B.layers)){let jt=gt.side;gt.side=Gt,gt.needsUpdate=!0,Fc(at,k,B,Ie,gt,et),gt.side=jt,gt.needsUpdate=!0,Je=!0}}Je===!0&&(pe.updateMultisampleRenderTarget(ae),pe.updateRenderTargetMipmap(ae))}v.setRenderTarget(we,xe,Ne),v.setClearColor(W,q),Le!==void 0&&(B.viewport=Le),v.toneMapping=Fe}function Rs(x,N,k){let B=N.isScene===!0?N.overrideMaterial:null;for(let U=0,ae=x.length;U<ae;U++){let _e=x[U],we=_e.object,xe=_e.geometry,Ne=_e.group,Fe=_e.material;Fe.allowOverride===!0&&B!==null&&(Fe=B),we.layers.test(k.layers)&&Fc(we,N,k,xe,Fe,Ne)}}function Fc(x,N,k,B,U,ae){x.onBeforeRender(v,N,k,B,U,ae),x.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),U.onBeforeRender(v,N,k,B,x,ae),U.transparent===!0&&U.side===$t&&U.forceSinglePass===!1?(U.side=Gt,U.needsUpdate=!0,v.renderBufferDirect(k,N,B,U,x,ae),U.side=Xn,U.needsUpdate=!0,v.renderBufferDirect(k,N,B,U,x,ae),U.side=$t):v.renderBufferDirect(k,N,B,U,x,ae),x.onAfterRender(v,N,k,B,U,ae)}function Ps(x,N,k){N.isScene!==!0&&(N=Se);let B=ie.get(x),U=p.state.lights,ae=p.state.shadowsArray,_e=U.state.version,we=H.getParameters(x,U.state,ae,N,k),xe=H.getProgramCacheKey(we),Ne=B.programs;B.environment=x.isMeshStandardMaterial?N.environment:null,B.fog=N.fog,B.envMap=(x.isMeshStandardMaterial?Oe:ke).get(x.envMap||B.environment),B.envMapRotation=B.environment!==null&&x.envMap===null?N.environmentRotation:x.envMapRotation,Ne===void 0&&(x.addEventListener("dispose",K),Ne=new Map,B.programs=Ne);let Fe=Ne.get(xe);if(Fe!==void 0){if(B.currentProgram===Fe&&B.lightsStateVersion===_e)return kc(x,we),Fe}else we.uniforms=H.getUniforms(x),x.onBeforeCompile(we,v),Fe=H.acquireProgram(we,xe),Ne.set(xe,Fe),B.uniforms=we.uniforms;let Le=B.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(Le.clippingPlanes=he.uniform),kc(x,we),B.needsLights=pu(x),B.lightsStateVersion=_e,B.needsLights&&(Le.ambientLightColor.value=U.state.ambient,Le.lightProbe.value=U.state.probe,Le.directionalLights.value=U.state.directional,Le.directionalLightShadows.value=U.state.directionalShadow,Le.spotLights.value=U.state.spot,Le.spotLightShadows.value=U.state.spotShadow,Le.rectAreaLights.value=U.state.rectArea,Le.ltc_1.value=U.state.rectAreaLTC1,Le.ltc_2.value=U.state.rectAreaLTC2,Le.pointLights.value=U.state.point,Le.pointLightShadows.value=U.state.pointShadow,Le.hemisphereLights.value=U.state.hemi,Le.directionalShadowMap.value=U.state.directionalShadowMap,Le.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Le.spotShadowMap.value=U.state.spotShadowMap,Le.spotLightMatrix.value=U.state.spotLightMatrix,Le.spotLightMap.value=U.state.spotLightMap,Le.pointShadowMap.value=U.state.pointShadowMap,Le.pointShadowMatrix.value=U.state.pointShadowMatrix),B.currentProgram=Fe,B.uniformsList=null,Fe}function Oc(x){if(x.uniformsList===null){let N=x.currentProgram.getUniforms();x.uniformsList=Mr.seqWithValue(N.seq,x.uniforms)}return x.uniformsList}function kc(x,N){let k=ie.get(x);k.outputColorSpace=N.outputColorSpace,k.batching=N.batching,k.batchingColor=N.batchingColor,k.instancing=N.instancing,k.instancingColor=N.instancingColor,k.instancingMorph=N.instancingMorph,k.skinning=N.skinning,k.morphTargets=N.morphTargets,k.morphNormals=N.morphNormals,k.morphColors=N.morphColors,k.morphTargetsCount=N.morphTargetsCount,k.numClippingPlanes=N.numClippingPlanes,k.numIntersection=N.numClipIntersection,k.vertexAlphas=N.vertexAlphas,k.vertexTangents=N.vertexTangents,k.toneMapping=N.toneMapping}function du(x,N,k,B,U){N.isScene!==!0&&(N=Se),pe.resetTextureUnits();let ae=N.fog,_e=B.isMeshStandardMaterial?N.environment:null,we=D===null?v.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:Ei,xe=(B.isMeshStandardMaterial?Oe:ke).get(B.envMap||_e),Ne=B.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Fe=!!k.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),Le=!!k.morphAttributes.position,Je=!!k.morphAttributes.normal,rt=!!k.morphAttributes.color,bt=Zn;B.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(bt=v.toneMapping);let dt=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,at=dt!==void 0?dt.length:0,Ie=ie.get(B),gt=p.state.lights;if(Xe===!0&&(Y===!0||x!==b)){let zt=x===b&&B.id===M;he.setState(B,x,zt)}let et=!1;B.version===Ie.__version?(Ie.needsLights&&Ie.lightsStateVersion!==gt.state.version||Ie.outputColorSpace!==we||U.isBatchedMesh&&Ie.batching===!1||!U.isBatchedMesh&&Ie.batching===!0||U.isBatchedMesh&&Ie.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Ie.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Ie.instancing===!1||!U.isInstancedMesh&&Ie.instancing===!0||U.isSkinnedMesh&&Ie.skinning===!1||!U.isSkinnedMesh&&Ie.skinning===!0||U.isInstancedMesh&&Ie.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Ie.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Ie.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Ie.instancingMorph===!1&&U.morphTexture!==null||Ie.envMap!==xe||B.fog===!0&&Ie.fog!==ae||Ie.numClippingPlanes!==void 0&&(Ie.numClippingPlanes!==he.numPlanes||Ie.numIntersection!==he.numIntersection)||Ie.vertexAlphas!==Ne||Ie.vertexTangents!==Fe||Ie.morphTargets!==Le||Ie.morphNormals!==Je||Ie.morphColors!==rt||Ie.toneMapping!==bt||Ie.morphTargetsCount!==at)&&(et=!0):(et=!0,Ie.__version=B.version);let jt=Ie.currentProgram;et===!0&&(jt=Ps(B,N,U));let Gi=!1,Qt=!1,Ir=!1,yt=jt.getUniforms(),ln=Ie.uniforms;if($.useProgram(jt.program)&&(Gi=!0,Qt=!0,Ir=!0),B.id!==M&&(M=B.id,Qt=!0),Gi||b!==x){$.buffers.depth.getReversed()&&x.reversedDepth!==!0&&(x._reversedDepth=!0,x.updateProjectionMatrix()),yt.setValue(A,"projectionMatrix",x.projectionMatrix),yt.setValue(A,"viewMatrix",x.matrixWorldInverse);let qt=yt.map.cameraPosition;qt!==void 0&&qt.setValue(A,be.setFromMatrixPosition(x.matrixWorld)),Z.logarithmicDepthBuffer&&yt.setValue(A,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&yt.setValue(A,"isOrthographic",x.isOrthographicCamera===!0),b!==x&&(b=x,Qt=!0,Ir=!0)}if(U.isSkinnedMesh){yt.setOptional(A,U,"bindMatrix"),yt.setOptional(A,U,"bindMatrixInverse");let zt=U.skeleton;zt&&(zt.boneTexture===null&&zt.computeBoneTexture(),yt.setValue(A,"boneTexture",zt.boneTexture,pe))}U.isBatchedMesh&&(yt.setOptional(A,U,"batchingTexture"),yt.setValue(A,"batchingTexture",U._matricesTexture,pe),yt.setOptional(A,U,"batchingIdTexture"),yt.setValue(A,"batchingIdTexture",U._indirectTexture,pe),yt.setOptional(A,U,"batchingColorTexture"),U._colorsTexture!==null&&yt.setValue(A,"batchingColorTexture",U._colorsTexture,pe));let cn=k.morphAttributes;if((cn.position!==void 0||cn.normal!==void 0||cn.color!==void 0)&&re.update(U,k,jt),(Qt||Ie.receiveShadow!==U.receiveShadow)&&(Ie.receiveShadow=U.receiveShadow,yt.setValue(A,"receiveShadow",U.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(ln.envMap.value=xe,ln.flipEnvMap.value=xe.isCubeTexture&&xe.isRenderTargetTexture===!1?-1:1),B.isMeshStandardMaterial&&B.envMap===null&&N.environment!==null&&(ln.envMapIntensity.value=N.environmentIntensity),Qt&&(yt.setValue(A,"toneMappingExposure",v.toneMappingExposure),Ie.needsLights&&uu(ln,Ir),ae&&B.fog===!0&&j.refreshFogUniforms(ln,ae),j.refreshMaterialUniforms(ln,B,G,te,p.state.transmissionRenderTarget[x.id]),Mr.upload(A,Oc(Ie),ln,pe)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(Mr.upload(A,Oc(Ie),ln,pe),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&yt.setValue(A,"center",U.center),yt.setValue(A,"modelViewMatrix",U.modelViewMatrix),yt.setValue(A,"normalMatrix",U.normalMatrix),yt.setValue(A,"modelMatrix",U.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){let zt=B.uniformsGroups;for(let qt=0,Wo=zt.length;qt<Wo;qt++){let gi=zt[qt];He.update(gi,jt),He.bind(gi,jt)}}return jt}function uu(x,N){x.ambientLightColor.needsUpdate=N,x.lightProbe.needsUpdate=N,x.directionalLights.needsUpdate=N,x.directionalLightShadows.needsUpdate=N,x.pointLights.needsUpdate=N,x.pointLightShadows.needsUpdate=N,x.spotLights.needsUpdate=N,x.spotLightShadows.needsUpdate=N,x.rectAreaLights.needsUpdate=N,x.hemisphereLights.needsUpdate=N}function pu(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return L},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(x,N,k){let B=ie.get(x);B.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,B.__autoAllocateDepthBuffer===!1&&(B.__useRenderToTexture=!1),ie.get(x.texture).__webglTexture=N,ie.get(x.depthTexture).__webglTexture=B.__autoAllocateDepthBuffer?void 0:k,B.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,N){let k=ie.get(x);k.__webglFramebuffer=N,k.__useDefaultFramebuffer=N===void 0};let fu=A.createFramebuffer();this.setRenderTarget=function(x,N=0,k=0){D=x,C=N,L=k;let B=!0,U=null,ae=!1,_e=!1;if(x){let xe=ie.get(x);if(xe.__useDefaultFramebuffer!==void 0)$.bindFramebuffer(A.FRAMEBUFFER,null),B=!1;else if(xe.__webglFramebuffer===void 0)pe.setupRenderTarget(x);else if(xe.__hasExternalTextures)pe.rebindTextures(x,ie.get(x.texture).__webglTexture,ie.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){let Le=x.depthTexture;if(xe.__boundDepthTexture!==Le){if(Le!==null&&ie.has(Le)&&(x.width!==Le.image.width||x.height!==Le.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");pe.setupDepthRenderbuffer(x)}}let Ne=x.texture;(Ne.isData3DTexture||Ne.isDataArrayTexture||Ne.isCompressedArrayTexture)&&(_e=!0);let Fe=ie.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(Fe[N])?U=Fe[N][k]:U=Fe[N],ae=!0):x.samples>0&&pe.useMultisampledRTT(x)===!1?U=ie.get(x).__webglMultisampledFramebuffer:Array.isArray(Fe)?U=Fe[k]:U=Fe,P.copy(x.viewport),O.copy(x.scissor),z=x.scissorTest}else P.copy(ge).multiplyScalar(G).floor(),O.copy(De).multiplyScalar(G).floor(),z=Ye;if(k!==0&&(U=fu),$.bindFramebuffer(A.FRAMEBUFFER,U)&&B&&$.drawBuffers(x,U),$.viewport(P),$.scissor(O),$.setScissorTest(z),ae){let xe=ie.get(x.texture);A.framebufferTexture2D(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_CUBE_MAP_POSITIVE_X+N,xe.__webglTexture,k)}else if(_e){let xe=N;for(let Ne=0;Ne<x.textures.length;Ne++){let Fe=ie.get(x.textures[Ne]);A.framebufferTextureLayer(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0+Ne,Fe.__webglTexture,k,xe)}}else if(x!==null&&k!==0){let xe=ie.get(x.texture);A.framebufferTexture2D(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,xe.__webglTexture,k)}M=-1},this.readRenderTargetPixels=function(x,N,k,B,U,ae,_e,we=0){if(!(x&&x.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=ie.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&_e!==void 0&&(xe=xe[_e]),xe){$.bindFramebuffer(A.FRAMEBUFFER,xe);try{let Ne=x.textures[we],Fe=Ne.format,Le=Ne.type;if(!Z.textureFormatReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Z.textureTypeReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=x.width-B&&k>=0&&k<=x.height-U&&(x.textures.length>1&&A.readBuffer(A.COLOR_ATTACHMENT0+we),A.readPixels(N,k,B,U,Re.convert(Fe),Re.convert(Le),ae))}finally{let Ne=D!==null?ie.get(D).__webglFramebuffer:null;$.bindFramebuffer(A.FRAMEBUFFER,Ne)}}},this.readRenderTargetPixelsAsync=async function(x,N,k,B,U,ae,_e,we=0){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=ie.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&_e!==void 0&&(xe=xe[_e]),xe)if(N>=0&&N<=x.width-B&&k>=0&&k<=x.height-U){$.bindFramebuffer(A.FRAMEBUFFER,xe);let Ne=x.textures[we],Fe=Ne.format,Le=Ne.type;if(!Z.textureFormatReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Z.textureTypeReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Je=A.createBuffer();A.bindBuffer(A.PIXEL_PACK_BUFFER,Je),A.bufferData(A.PIXEL_PACK_BUFFER,ae.byteLength,A.STREAM_READ),x.textures.length>1&&A.readBuffer(A.COLOR_ATTACHMENT0+we),A.readPixels(N,k,B,U,Re.convert(Fe),Re.convert(Le),0);let rt=D!==null?ie.get(D).__webglFramebuffer:null;$.bindFramebuffer(A.FRAMEBUFFER,rt);let bt=A.fenceSync(A.SYNC_GPU_COMMANDS_COMPLETE,0);return A.flush(),await Qh(A,bt,4),A.bindBuffer(A.PIXEL_PACK_BUFFER,Je),A.getBufferSubData(A.PIXEL_PACK_BUFFER,0,ae),A.deleteBuffer(Je),A.deleteSync(bt),ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,N=null,k=0){let B=Math.pow(2,-k),U=Math.floor(x.image.width*B),ae=Math.floor(x.image.height*B),_e=N!==null?N.x:0,we=N!==null?N.y:0;pe.setTexture2D(x,0),A.copyTexSubImage2D(A.TEXTURE_2D,k,0,0,_e,we,U,ae),$.unbindTexture()};let mu=A.createFramebuffer(),gu=A.createFramebuffer();this.copyTextureToTexture=function(x,N,k=null,B=null,U=0,ae=null){ae===null&&(U!==0?(or("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ae=U,U=0):ae=0);let _e,we,xe,Ne,Fe,Le,Je,rt,bt,dt=x.isCompressedTexture?x.mipmaps[ae]:x.image;if(k!==null)_e=k.max.x-k.min.x,we=k.max.y-k.min.y,xe=k.isBox3?k.max.z-k.min.z:1,Ne=k.min.x,Fe=k.min.y,Le=k.isBox3?k.min.z:0;else{let cn=Math.pow(2,-U);_e=Math.floor(dt.width*cn),we=Math.floor(dt.height*cn),x.isDataArrayTexture?xe=dt.depth:x.isData3DTexture?xe=Math.floor(dt.depth*cn):xe=1,Ne=0,Fe=0,Le=0}B!==null?(Je=B.x,rt=B.y,bt=B.z):(Je=0,rt=0,bt=0);let at=Re.convert(N.format),Ie=Re.convert(N.type),gt;N.isData3DTexture?(pe.setTexture3D(N,0),gt=A.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(pe.setTexture2DArray(N,0),gt=A.TEXTURE_2D_ARRAY):(pe.setTexture2D(N,0),gt=A.TEXTURE_2D),A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL,N.flipY),A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),A.pixelStorei(A.UNPACK_ALIGNMENT,N.unpackAlignment);let et=A.getParameter(A.UNPACK_ROW_LENGTH),jt=A.getParameter(A.UNPACK_IMAGE_HEIGHT),Gi=A.getParameter(A.UNPACK_SKIP_PIXELS),Qt=A.getParameter(A.UNPACK_SKIP_ROWS),Ir=A.getParameter(A.UNPACK_SKIP_IMAGES);A.pixelStorei(A.UNPACK_ROW_LENGTH,dt.width),A.pixelStorei(A.UNPACK_IMAGE_HEIGHT,dt.height),A.pixelStorei(A.UNPACK_SKIP_PIXELS,Ne),A.pixelStorei(A.UNPACK_SKIP_ROWS,Fe),A.pixelStorei(A.UNPACK_SKIP_IMAGES,Le);let yt=x.isDataArrayTexture||x.isData3DTexture,ln=N.isDataArrayTexture||N.isData3DTexture;if(x.isDepthTexture){let cn=ie.get(x),zt=ie.get(N),qt=ie.get(cn.__renderTarget),Wo=ie.get(zt.__renderTarget);$.bindFramebuffer(A.READ_FRAMEBUFFER,qt.__webglFramebuffer),$.bindFramebuffer(A.DRAW_FRAMEBUFFER,Wo.__webglFramebuffer);for(let gi=0;gi<xe;gi++)yt&&(A.framebufferTextureLayer(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,ie.get(x).__webglTexture,U,Le+gi),A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,ie.get(N).__webglTexture,ae,bt+gi)),A.blitFramebuffer(Ne,Fe,_e,we,Je,rt,_e,we,A.DEPTH_BUFFER_BIT,A.NEAREST);$.bindFramebuffer(A.READ_FRAMEBUFFER,null),$.bindFramebuffer(A.DRAW_FRAMEBUFFER,null)}else if(U!==0||x.isRenderTargetTexture||ie.has(x)){let cn=ie.get(x),zt=ie.get(N);$.bindFramebuffer(A.READ_FRAMEBUFFER,mu),$.bindFramebuffer(A.DRAW_FRAMEBUFFER,gu);for(let qt=0;qt<xe;qt++)yt?A.framebufferTextureLayer(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,cn.__webglTexture,U,Le+qt):A.framebufferTexture2D(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,cn.__webglTexture,U),ln?A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,zt.__webglTexture,ae,bt+qt):A.framebufferTexture2D(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,zt.__webglTexture,ae),U!==0?A.blitFramebuffer(Ne,Fe,_e,we,Je,rt,_e,we,A.COLOR_BUFFER_BIT,A.NEAREST):ln?A.copyTexSubImage3D(gt,ae,Je,rt,bt+qt,Ne,Fe,_e,we):A.copyTexSubImage2D(gt,ae,Je,rt,Ne,Fe,_e,we);$.bindFramebuffer(A.READ_FRAMEBUFFER,null),$.bindFramebuffer(A.DRAW_FRAMEBUFFER,null)}else ln?x.isDataTexture||x.isData3DTexture?A.texSubImage3D(gt,ae,Je,rt,bt,_e,we,xe,at,Ie,dt.data):N.isCompressedArrayTexture?A.compressedTexSubImage3D(gt,ae,Je,rt,bt,_e,we,xe,at,dt.data):A.texSubImage3D(gt,ae,Je,rt,bt,_e,we,xe,at,Ie,dt):x.isDataTexture?A.texSubImage2D(A.TEXTURE_2D,ae,Je,rt,_e,we,at,Ie,dt.data):x.isCompressedTexture?A.compressedTexSubImage2D(A.TEXTURE_2D,ae,Je,rt,dt.width,dt.height,at,dt.data):A.texSubImage2D(A.TEXTURE_2D,ae,Je,rt,_e,we,at,Ie,dt);A.pixelStorei(A.UNPACK_ROW_LENGTH,et),A.pixelStorei(A.UNPACK_IMAGE_HEIGHT,jt),A.pixelStorei(A.UNPACK_SKIP_PIXELS,Gi),A.pixelStorei(A.UNPACK_SKIP_ROWS,Qt),A.pixelStorei(A.UNPACK_SKIP_IMAGES,Ir),ae===0&&N.generateMipmaps&&A.generateMipmap(gt),$.unbindTexture()},this.initRenderTarget=function(x){ie.get(x).__webglFramebuffer===void 0&&pe.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?pe.setTextureCube(x,0):x.isData3DTexture?pe.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?pe.setTexture2DArray(x,0):pe.setTexture2D(x,0),$.unbindTexture()},this.resetState=function(){C=0,L=0,D=null,$.reset(),ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=je._getDrawingBufferColorSpace(e),t.unpackColorSpace=je._getUnpackColorSpace()}};var Ud={type:"change"},yc={type:"start"},Od={type:"end"},Do=new Ai,Fd=new dn,uy=Math.cos(70*Ct.DEG2RAD),Lt=new T,Zt=2*Math.PI,st={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},gc=1e-6,No=class extends ys{constructor(e,t=null){super(e,t),this.state=st.NONE,this.target=new T,this.cursor=new T,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:li.ROTATE,MIDDLE:li.DOLLY,RIGHT:li.PAN},this.touches={ONE:ci.ROTATE,TWO:ci.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new T,this._lastQuaternion=new Dt,this._lastTargetPosition=new T,this._quat=new Dt().setFromUnitVectors(e.up,new T(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new mr,this._sphericalDelta=new mr,this._scale=1,this._panOffset=new T,this._rotateStart=new ce,this._rotateEnd=new ce,this._rotateDelta=new ce,this._panStart=new ce,this._panEnd=new ce,this._panDelta=new ce,this._dollyStart=new ce,this._dollyEnd=new ce,this._dollyDelta=new ce,this._dollyDirection=new T,this._mouse=new ce,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=fy.bind(this),this._onPointerDown=py.bind(this),this._onPointerUp=my.bind(this),this._onContextMenu=My.bind(this),this._onMouseWheel=_y.bind(this),this._onKeyDown=vy.bind(this),this._onTouchStart=xy.bind(this),this._onTouchMove=by.bind(this),this._onMouseDown=gy.bind(this),this._onMouseMove=yy.bind(this),this._interceptControlDown=wy.bind(this),this._interceptControlUp=Sy.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Ud),this.update(),this.state=st.NONE}update(e=null){let t=this.object.position;Lt.copy(t).sub(this.target),Lt.applyQuaternion(this._quat),this._spherical.setFromVector3(Lt),this.autoRotate&&this.state===st.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=Zt:n>Math.PI&&(n-=Zt),r<-Math.PI?r+=Zt:r>Math.PI&&(r-=Zt),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=a!=this._spherical.radius}if(Lt.setFromSpherical(this._spherical),Lt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Lt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Lt.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),s=!!l}else if(this.object.isOrthographicCamera){let o=new T(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=l!==this.object.zoom;let c=new T(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Lt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Do.origin.copy(this.object.position),Do.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Do.direction))<uy?this.object.lookAt(this.target):(Fd.setFromNormalAndCoplanarPoint(this.object.up,this.target),Do.intersectPlane(Fd,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>gc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>gc||this._lastTargetPosition.distanceToSquared(this.target)>gc?(this.dispatchEvent(Ud),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Zt/60*this.autoRotateSpeed*e:Zt/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Lt.setFromMatrixColumn(t,0),Lt.multiplyScalar(-e),this._panOffset.add(Lt)}_panUp(e,t){this.screenSpacePanning===!0?Lt.setFromMatrixColumn(t,1):(Lt.setFromMatrixColumn(t,0),Lt.crossVectors(this.object.up,Lt)),Lt.multiplyScalar(e),this._panOffset.add(Lt)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;Lt.copy(r).sub(this.target);let s=Lt.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*s/n.clientHeight,this.object.matrix),this._panUp(2*t*s/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),r=e-n.left,s=t-n.top,a=n.width,o=n.height;this._mouse.x=r/a*2-1,this._mouse.y=-(s/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Zt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Zt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(n*n+r*r);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),r=.5*(e.pageX+n.x),s=.5*(e.pageY+n.y);this._rotateEnd.set(r,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Zt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Zt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new ce,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function py(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function fy(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function my(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Od),this.state=st.NONE;break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function gy(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case li.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=st.DOLLY;break;case li.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=st.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=st.ROTATE}break;case li.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=st.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=st.PAN}break;default:this.state=st.NONE}this.state!==st.NONE&&this.dispatchEvent(yc)}function yy(i){switch(this.state){case st.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case st.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case st.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function _y(i){this.enabled===!1||this.enableZoom===!1||this.state!==st.NONE||(i.preventDefault(),this.dispatchEvent(yc),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Od))}function vy(i){this.enabled!==!1&&this._handleKeyDown(i)}function xy(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case ci.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=st.TOUCH_ROTATE;break;case ci.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=st.TOUCH_PAN;break;default:this.state=st.NONE}break;case 2:switch(this.touches.TWO){case ci.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=st.TOUCH_DOLLY_PAN;break;case ci.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=st.TOUCH_DOLLY_ROTATE;break;default:this.state=st.NONE}break;default:this.state=st.NONE}this.state!==st.NONE&&this.dispatchEvent(yc)}function by(i){switch(this._trackPointer(i),this.state){case st.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case st.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case st.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case st.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=st.NONE}}function My(i){this.enabled!==!1&&i.preventDefault()}function wy(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Sy(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var ne={frame:12043974,bumper:13078401,rail:7052709,plate:9483924,coral:13938521,algae:8628850,climb:10848956,shaft:6649724,rubber:4279118,battery:4542293,ball:6140330},_c=new Map;function Ey(i){return _c.has(i)||_c.set(i,new Yn({color:i,roughness:.72,metalness:.08})),_c.get(i)}function on(i,e,t,n,r=[0,0,0]){let s=new Mt(t,Ey(n));return s.name=e,s.position.set(...r),s.castShadow=!0,s.receiveShadow=!0,i.add(s),s}function Ke(i,e,t,n,r){return on(i,e,new In(...n),r,t)}function qe(i,e,t,n,r,s,a){let o=new T(...t),l=new T(...n),c=l.clone().sub(o);if(c.length()<1e-5)throw new Error(`${e}: zero-length beam`);let h=Ke(i,e,o.clone().add(l).multiplyScalar(.5).toArray(),[r,s,c.length()],a);return h.quaternion.setFromUnitVectors(new T(0,0,1),c.normalize()),h}function Ve(i,e,t,n,r,s=ne.shaft){let a=new T(...t),o=new T(...n),l=o.clone().sub(a);if(l.length()<1e-5)throw new Error(`${e}: zero-length axle`);let c=on(i,e,new Sn(r,r,l.length(),24),s,a.clone().add(o).multiplyScalar(.5).toArray());return c.quaternion.setFromUnitVectors(new T(0,1,0),l.normalize()),c}function Tt(i,e,t,n,r,s=ne.coral,a=!1){let[o,l,c]=t;if(Ve(i,`${e} shaft`,[o-n/2-18,l,c],[o+n/2+18,l,c],6.35),a){let h=Math.max(3,Math.floor(n/55));for(let d=0;d<h;d++){let u=o-n/2+(d+.5)*n/h;Ve(i,`${e} compliant wheel ${d+1}`,[u-14,l,c],[u+14,l,c],r,s)}}else Ve(i,`${e} tube`,[o-n/2,l,c],[o+n/2,l,c],r,s)}function Jt(i,e,t,n,r,s=ne.plate){let a=new ur;n.forEach(([l,c],h)=>h?a.lineTo(l,c):a.moveTo(l,c)),a.closePath();let o=new ds(a,{depth:r,bevelEnabled:!1});return o.applyMatrix4(new ft().set(0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1)),on(i,e,o,s,[t-r/2,0,0])}var xc=[{id:"R01",coral:"lift",pickup:"roller",algae:"arm",climb:"deep",height:2020,coralX:-130,algaeX:160},{id:"R02",coral:"sharedLift",pickup:null,algae:"shared",climb:"shallow",height:2040,coralX:0,algaeX:0},{id:"R03",coral:"lift",pickup:null,algae:"arm",shooter:!0,climb:"deep",height:2040,coralX:-160,algaeX:180},{id:"R04",coral:"telescope",pickup:null,algae:"shared",climb:"deep",height:2020,coralX:0,algaeX:0},{id:"R05",coral:"lift",pickup:"carrier",algae:"shortArm",climb:"shallow",height:2020,coralX:-120,algaeX:170},{id:"R06",coral:"turret",pickup:null,algae:"shared",climb:"park",height:2040,coralX:0,algaeX:0},{id:"R07",coral:"lift",pickup:"belt",algae:"telescope",climb:"deep",height:1390,coralX:-130,algaeX:165},{id:"R08",coral:"shortArm",pickup:"carrier",algae:"shortArm",climb:"shallow",height:970,coralX:-130,algaeX:170},{id:"R09",coral:"rearArm",pickup:null,algae:"lift",shooter:!0,climb:"deep",height:1370,coralX:-140,algaeX:80},{id:"R10",coral:"foldLift",pickup:null,algae:"foldLift",climb:"shallow",height:2030,coralX:-180,algaeX:180}],Ty=["travel","stow","floor","station","coral","algae","climb"];function bc(i,e,t,n,r,s=ne.plate){let a=new pt;a.name=e,a.position.set(...t),i.add(a);for(let o of[-1,1])Jt(a,`${e} cheek`,o*n/2,r,8,s);return a}function vc(i,e,t=0,n=!1){let r=n?310:245,s=bc(i,n?"Dual-shape wrist":"Coral wrist",e,r,[[-145,-55],[-145,70],[60,90],[125,30],[95,-65]],ne.plate);if(s.rotation.x=t,Tt(s,"Lower retention",[0,-60,-35],r-15,30,ne.coral),Tt(s,"Upper drive",[0,-35,65],r-15,32,ne.coral,!0),Tt(s,"Rear guide",[0,65,0],r-15,22,ne.rail),Ve(s,"Pitch axle",[-r/2-20,80,0],[r/2+20,80,0],12),Ke(s,"Retention floor",[0,0,-64],[r-8,180,5],ne.plate),n){for(let a of[-155,155])qe(s,"Algae finger",[a,70,0],[a,-170,-20],20,30,ne.algae);Tt(s,"Algae contact pair",[0,-155,-20],290,40,ne.algae,!0)}return s}function kd(i,e){let t=bc(i,"Algae jaw",e,330,[[-145,-75],[-180,65],[-55,145],[105,90],[110,-65]],ne.algae);return Tt(t,"Algae lower contact",[0,-95,-65],310,42,ne.algae,!0),Tt(t,"Algae upper contact",[0,-80,105],310,42,ne.algae,!0),Tt(t,"Algae backing",[0,90,35],310,32,ne.rail),Ve(t,"Jaw mounting axle",[-180,105,35],[180,105,35],12),t}function Uo(i,e,t="y"){let n=new Sn(57.15,57.15,301.625,32,1,!0),r=on(i,"Nominal coral",n,15131607,e);t==="z"&&(r.rotation.x=Math.PI/2),t==="x"&&(r.rotation.z=Math.PI/2);let s=new Yn({color:15131607,side:$t,roughness:.9});for(let a of[-1,1]){let o=new Mt(new qn(50.8,57.15,32),s);o.rotation.x=Math.PI/2,o.position.y=a*301.625/2,r.add(o)}return r}function Fo(i,e){return on(i,"Nominal algae",new En(206.375,32,20),ne.ball,e)}function Mc(i){for(let e of[-325,325])qe(i,"Chassis side rail",[e,30,125],[e,730,125],50,50,ne.frame);for(let e of[25,735])qe(i,"Chassis cross rail",[-300,e,125],[300,e,125],50,50,ne.frame);Ke(i,"Bellypan",[0,380,75],[645,685,5],12043709);for(let e of[-392.5,392.5])Ke(i,"Side bumper",[e,380,105],[85,760,120],ne.bumper);for(let e of[-42.5,802.5])Ke(i,"End bumper",[0,e,105],[870,85,120],ne.bumper);for(let e of[-245,245])for(let t of[110,650])Ke(i,"Swerve fork",[e,t,100],[115,125,20],ne.shaft),Ve(i,"Drive tread",[e-23,t,55],[e+23,t,55],50,ne.rubber),Ve(i,"Steer axis",[e,t,108],[e,t,160],30,ne.rail);Ke(i,"Battery",[0,600,235],[180,240,165],ne.battery);for(let e of[-105,105])qe(i,"Battery restraint",[e,470,150],[e,720,150],15,20,ne.shaft);Ke(i,"Electrical tray",[-220,450,170],[155,150,8],ne.frame);for(let e=0;e<3;e++)Ke(i,"Electrical module",[-225,400+45*e,195],[90,25,30],ne.battery)}function Bd(i,e,t,n,r,s=ne.rail,a=0){let o=new pt;o.name=e,o.position.set(t,n,160),o.rotation.x=a,i.add(o);let l=760,c=Math.max(0,r-800)/2;for(let d=0;d<3;d++){let u=155-d*25,f=d*c;for(let g of[-1,1])qe(o,`${e} rail ${d+1}`,[g*u,d*24,f],[g*u,d*24,f+l],25,35,s),Ve(o,"Stage return pulley",[g*u-8,d*24,f+l-35],[g*u+8,d*24,f+l-35],22,ne.shaft);for(let g of[f+15,f+l-15])qe(o,"Stage crossmember",[-u,d*24,g],[u,d*24,g],25,25,s)}let h=r-160;for(let d of[-1,1])Ke(o,"Carriage side",[d*100,55,h],[28,55,115],ne.plate);return qe(o,"Carriage bridge",[-100,45,h],[100,45,h],30,35,ne.plate),Ve(o,"Lift drive",[-150,0,55],[150,0,55],22,ne.shaft),o}function zd(i,e,t,n=0){let r=new pt;r.position.set(...e),r.rotation.x=n,i.add(r);for(let s of[-95,95])qe(r,"Wrist pitch cheek",[s,0,0],[s,-t,0],18,40,ne.plate);return Ve(r,"Wrist pivot",[-140,0,0],[140,0,0],18,ne.shaft),{group:r,tool:[0,-t,0]}}function Hd(i,e,t,n,r=ne.plate){let s=new T(...t),a=new T(...n),o=a.clone().sub(s),l=o.length(),c=o.clone().normalize(),h=Math.max(2,Math.ceil(l/720));for(let d=0;d<h;d++){let u=d*l/h,f=Math.min(l,(d+1)*l/h+100);qe(i,`${e} nested ${d+1}`,s.clone().addScaledVector(c,u).toArray(),s.clone().addScaledVector(c,f).toArray(),Math.max(30,80-d*17),Math.max(40,100-d*17),r)}return Ve(i,`${e} shoulder`,[t[0]-90,t[1],t[2]],[t[0]+90,t[1],t[2]],32,ne.shaft),a.toArray()}function Vd(i,e,t,n,r,s,a=ne.plate){let o=n[1]-t[1],l=n[2]-t[2],c=Math.hypot(o,l);if(c>r+s||c<Math.abs(r-s))throw new Error(`${e}: requested cartoon pose out of two-link reach`);let h=Math.atan2(l,o)-(o<0?1:-1)*Math.acos((r*r+c*c-s*s)/(2*r*c)),d=[t[0],t[1]+r*Math.cos(h),t[2]+r*Math.sin(h)];for(let u of[-45,45]){let f=g=>[g[0]+u,g[1],g[2]];qe(i,`${e} upper`,f(t),f(d),20,55,a),qe(i,`${e} lower`,f(d),f(n),18,45,a)}for(let[u,f]of[t,d,n].entries())Ve(i,`${e} joint ${u+1}`,[f[0]-65,f[1],f[2]],[f[0]+65,f[1],f[2]],u===0?30:22,ne.shaft);return n}function Ay(i,e,t,n){let r=new pt;r.name="Coral floor carrier",r.position.set(t,45,215),i.add(r),r.rotation.x=n==="floor"?0:n==="stow"?-Math.PI/2:-.95;let s=e==="carrier"?420:450;for(let a of[-1,1])Jt(r,"Intake side plate",a*s/2,[[-370,-150],[-50,-10],[15,65],[-150,65],[-390,-85]],8,ne.plate);if(Ve(r,"Carrier pivot",[-s/2-15,0,0],[s/2+15,0,0],15),Tt(r,"Pickup nose",[0,-320,-130],s-15,52,ne.coral,!0),Tt(r,"Upper control",[0,-250,5],s-15,48,ne.rail),Tt(r,e==="carrier"?"Carrier locked lower":"Powered rear kicker",[0,-75,-25],s-15,35,e==="carrier"?ne.rubber:ne.coral,!0),qe(r,"Supported ramp",[0,-350,-172],[0,-25,-55],s-30,5,ne.plate),e==="belt")for(let a of[-100,100])qe(r,"Belt working run",[a,-310,-115],[a,-65,-15],60,5,ne.rubber)}function wc(i,e){let t=[e,200,760];for(let r of[-1,1])qe(i,"Launcher post",[e+r*205,210,155],[e+r*205,210,830],25,30,ne.rail);let n=[];for(let r=0;r<=10;r++){let s=.05+r*.12;n.push([40-260*Math.cos(s),80+260*Math.sin(s)])}for(let r of[-1,1])Jt(i,"Fixed hood cheek",e+r*210,n.map(([s,a])=>[t[1]+s,t[2]+a]),8,ne.plate);for(let r=0;r<7;r++){let s=.1+r*.18,a=t[1]+40-260*Math.cos(s),o=t[2]+80+260*Math.sin(s);Ke(i,"Hood slat",[e,a,o],[412,35,6],ne.coral).rotation.x=s}Tt(i,"Launcher flywheel",[e,80,790],395,90,ne.coral,!0),Tt(i,"Launcher feed roller",[e,310,610],390,50,ne.algae,!0);for(let r of[-1,1])Jt(i,"Feed side guide",e+r*210,[[90,545],[390,535],[400,745],[200,810]],7,ne.plate);qe(i,"Feed bed",[e,385,535],[e,100,585],405,6,ne.rail)}function Cy(i,e,t){if(e==="park")return;let n=new pt;n.name=`${e} climb`,n.position.set(0,660,180),i.add(n);let r=t==="climb",s=r?[0,350,e==="deep"?330:920]:[0,-75,650];for(let a of[-105,105]){qe(n,"Climb arm",[a,0,0],[a,s[1],s[2]],30,50,ne.climb);let o=bc(n,"Cage hook",[a,s[1],s[2]],22,[[-20,-60],[70,-60],[95,35],[70,70],[25,75],[20,45],[55,38],[45,-20],[-20,-20]],ne.climb);o.rotation.x=r?0:.15}Ve(n,"Climb pivot",[-155,0,0],[155,0,0],30,ne.shaft),Ve(n,"Winch spool",[-80,-35,90],[80,-35,90],40,ne.shaft),qe(n,"Climb crossbar",[-105,s[1],s[2]-50],[105,s[1],s[2]-50],25,25,ne.climb),Ve(n,"Winch cable",[0,-35,90],[0,s[1],s[2]-50],3,ne.rubber)}function Ry(i,e,t,n){let r=["telescope","turret","sharedLift"].includes(e.coral),s=t==="algae"||t==="floor"&&r;if(e.coral==="telescope"||e.coral==="turret"){let y=new pt;y.position.set(e.coralX,380,0),i.add(y),e.coral==="turret"&&(Ve(y,"Turret bearing",[0,0,180],[0,0,240],160,ne.shaft),y.rotation.z=t==="coral"?.4:t==="algae"?-.35:0);let m=[0,0,430];for(let w of[-130,130])Jt(y,"Shoulder tower",w,[[-110,150],[90,150],[65,470],[-55,500]],12,ne.rail);let p=t==="coral"?[0,-510,e.height]:t==="algae"?[0,-490,e.coral==="turret"?2250:1520]:t==="floor"?[0,-635,230]:t==="station"?[0,-440,1040]:[0,-130,850];Hd(y,"Scoring boom",m,p,ne.rail);let E=vc(y,p,0,!0);t==="coral"&&Uo(E,[0,-40,5]),s&&Fo(E,[0,-115,65]);return}if(e.coral==="shortArm"||e.coral==="rearArm"){let y=e.coral==="rearArm",m=[e.coralX,y?480:320,360];for(let w of[-1,1])qe(i,"Coral arm tower",[m[0]+w*65,m[1],160],[m[0]+w*65,m[1],360],30,40,ne.rail);let p=t==="coral"?[m[0],y?960:-170,e.height]:t==="floor"&&!e.pickup?[m[0],y?990:-255,140]:t==="station"?[m[0],y?880:-100,1040]:[m[0],y?480:240,750];if(y)Vd(i,"Rear coral arm",m,p,720,630,ne.rail);else{t==="stow"&&(p=[m[0],m[1]+290,m[2]+Math.sqrt(680*680-290*290)]);let w=new T(...p).sub(new T(...m)).normalize();p=new T(...m).addScaledVector(w,680).toArray();for(let v of[-65,65])qe(i,"Fixed scoring arm",[m[0]+v,m[1],m[2]],[p[0]+v,p[1],p[2]],22,45,ne.rail);Ve(i,"Scoring shoulder",[m[0]-90,m[1],m[2]],[m[0]+90,m[1],m[2]],26)}let E=vc(i,p);t==="coral"&&Uo(E,[0,-20,5]);return}let a=e.coralX,o=e.coral==="foldLift"?350:310,l=t==="coral"?e.height:t==="station"?1010:t==="algae"&&r?2330:t==="floor"&&!e.pickup?500:t==="stow"?700:1050,c=Bd(i,"Coral elevator",a,o,l,ne.rail,e.coral==="foldLift"&&t==="floor"?.4:0),h=t==="station"&&["R01","R03","R05"].includes(e.id),d=[0,48,l-160],u=h?-315:t==="floor"&&!e.pickup?420:330,f=zd(c,d,u,t==="floor"&&!e.pickup?.6:0);if(e.coral==="sharedLift"){for(let y of[-1,1])qe(f.group,"Reach slide",[y*85,0,0],[y*85,-u,0],25,28,ne.shaft);Ve(f.group,"Head selector",[0,-u,-40],[0,-u,40],55,ne.shaft)}let g=vc(f.group,f.tool,h?Math.PI:0,r);t==="coral"&&Uo(g,[0,-40,5]),t==="algae"&&r&&Fo(g,[0,-120,65])}function Py(i,e,t){if(e.algae==="shared")return;let n=t==="algae"||t==="floor",r=e.algaeX,s=[r,430,300],a=t==="floor"?[r,-250,250]:t==="algae"?[r,-160,e.algae==="shortArm"?1030:1500]:[r,230,750];if(e.algae==="lift"||e.algae==="foldLift"){a=t==="floor"?[r,-170,450]:t==="algae"?[r,-80,e.algae==="foldLift"?2350:1520]:[r,150,700];let o=Bd(i,"Algae elevator",r,360,a[2],ne.algae,e.algae==="foldLift"&&t==="floor"?.45:0),l=zd(o,[0,48,a[2]-160],408-a[1]),c=kd(l.group,l.tool);n&&Fo(c,[0,-105,25])}else{for(let l of[-1,1])qe(i,"Algae shoulder tower",[r+l*65,430,160],[r+l*65,430,300],25,35,ne.rail);e.algae==="telescope"?Hd(i,"Algae reach",s,a,ne.algae):Vd(i,"Algae arm",s,a,e.algae==="shortArm"?540:730,e.algae==="shortArm"?520:630,ne.algae);let o=kd(i,a);n&&Fo(o,[0,-100,25])}}function Gd(i,e="travel"){let t=xc.find(r=>r.id===i);if(!t||!Ty.includes(e))throw new Error("Unknown robot or pose");let n=new pt;return n.name=`${i} mechanism concept`,Mc(n),t.pickup&&Ay(n,t.pickup,0,e),t.shooter&&wc(n,70),Ry(n,t,e),Py(n,t,e),Cy(n,t.climb,e),e==="floor"&&t.pickup&&Uo(n,[0,-350,57.15],"x"),n.userData={id:i,pose:e,status:"ILLUSTRATIVE_MECHANISM_REVISION",kinematicsProven:!1,recipe:t},n}var Hi={season:2025,status:"BOUNDED_SOURCE_ANALYSIS",sources:[{id:"M",url:"https://firstfrc.blob.core.windows.net/frc2025/Manual/2025GameManual.pdf",sha256:"dc6aa9ddbeba25c679c58bae746bde14dba2af79a61a65d8c5f575ca6cdfd523",pages:[23,24,26,27,28,32,33,34,41,45,46,47,48,49,50,65,66,67,69,70,71,72,73,77,78,84,86,87,88],scope:"Final official 2025 English manual; ARENA V4, Game Details V13, Game/Construction Rules V11. Relevant body text read from cached PDF; no diagram measurement or exhaustive audit. Printed pages equal PDF pages. Bumper context also from the existing bounded rules packet.",cacheFile:"../../research/2025-coral/.cache/rules/manual.pdf"},{id:"U",url:"https://firstfrc.blob.core.windows.net/frc2025/Manual/TeamUpdates/TeamUpdate-Combined.pdf",sha256:"fc8c6292a5756244d1e896d01fc78bb620db9caa95913d42c02a450e379f10fb",pages:[1,4,28],scope:"PDF pages: TU21 2025-04-08 is final update and raises FIRST Championship thresholds; TU18 2025-03-18 retains District Championship thresholds; TU03 2025-01-14 corroborates five coral per level. Redline old/new text reconciled with final manual, not treated as simultaneous thresholds.",cacheFile:"../../research/2025-coral/.cache/rules/updates.pdf"},{id:"Q",url:"https://firstfrc.blob.core.windows.net/frc2025/FRC2025REEFSCAPE-QandAExport.pdf",sha256:"8f282af8993c2c790f3e695aec365b5edfe5918e1099a9572f149ba9fa58d890",pages:[5,6,42,43,51,52],scope:"Q18 answered 2025-01-10, Q144 2025-02-10, Q174 2025-02-18; PDF-page locators. Interpretation does not supersede manual. Export date is not answer effective date.",cacheFile:"../../research/2025-coral/.cache/rules/qa.pdf"},{id:"R1690_1778",url:"../../research/2025-coral/1690-1778.md",pages:[],scope:"Existing report: over-bumper transfer and centering during raise; principles only, no replica dimensions or performance."},{id:"R2056_6328",url:"../../research/2025-coral/2056-6328.md",pages:[],scope:"Existing report: independent-side orientation and 6328's attributed inspiration; no measured success rates."},{id:"R2056_BINDER",url:"../../research/2025-coral/2056-binder.md",pages:[],scope:"Existing selected-page report: pickup, alignment and cradle are separate functions; no new team-CAD download."},{id:"R2910",url:"../../research/2025-coral/2910-handoff.md",pages:[],scope:"Existing report: articulated arm carries intake; does not prove an independent elevator handoff or our algae path."}],scoring:{sourceRefs:["M","U"],manualSections:["6.1 p.41","6.4 pp.46-47","6.5.1-6.5.4 pp.47-50"],periodsSeconds:{auto:15,teleop:135,activeTotal:150,autoToTeleopScoringDelay:3,postPeriodElementAssessmentMaximum:3,postTeleopCageAssessmentMaximum:3},timingNotes:"The three-second transition is not extra AUTO driving time. Element assessment continues up to three seconds after each period; cage assessment is at rest or three seconds after TELEOP, whichever occurs first.",points:{leave:{auto:3},coral:{L1:{auto:3,teleop:2},L2:{auto:4,teleop:3},L3:{auto:6,teleop:4},L4:{auto:7,teleop:5}},algae:{processor:{auto:6,teleop:6},net:{auto:4,teleop:4}},barge:{park:{teleop:2},shallow:{teleop:6},deep:{teleop:12}}},algaeAttribution:{processorAwardedTo:"Alliance owning the scored processor; 6 points.",processorBallRecipient:"Opposing alliance HUMAN PLAYER in the adjacent PROCESSOR AREA.",netAwardedTo:"Alliance owning the scored net; 4 points, independent of whether robot or HUMAN PLAYER delivered it.",ourHumanPlayerSupply:"Opponent processor deliveries, not our processor deliveries.",humanPlayerMayEnterAlgaeInAuto:!1,humanPlayerEntryLocation:"Their PROCESSOR AREA; G433 p.73, with G404 p.65 prohibiting AUTO entry.",example:{condition:"Our processor score followed by successful opponent HP score in their net",ourPoints:6,opponentPoints:4,scoreMargin:2},sourceRefs:["M"],pages:[28,41,48,50,65,73]},criteria:{leave:"Bumpers no longer overlap the robot's starting line at end of AUTO.",coralL1:"No contact with own-alliance robot, not scored on another level, and contacting trough or directly supported at least partly by coral contacting trough.",coralL2ToL4:"Branch inside coral volume; no own-alliance robot or algae contact; only one coral per branch.",processor:"Ball passes through opening and by sensor array.",net:"Above and within net perimeter, contacting net or algae contacting net, and not contacting own-alliance robot.",park:"Bumpers partly or wholly within own BARGE ZONE at match end; not qualified for cage points.",cage:"Exactly one own-alliance cage; no carpet or ANCHOR contact. Additional permitted contacts: scoring elements, another cage-qualified robot, partner contacted by opponent in violation of G428, or opponent robot. M p.49.",endgameMutuallyExclusive:["park","shallow","deep"]},autoCoralAccounting:"AUTO points are not added again as TELEOP points. Removal in TELEOP removes AUTO match points, not AUTO-RP credit; rescoring that branch location restores AUTO points. L1 aggregate accounting removes TELEOP coral first and restores AUTO coral first (M p.48).",rankingPoints:{qualificationOnly:!0,auto:{rp:1,condition:"All non-BYPASSED robots LEAVE and at least one coral scored in AUTO."},coral:{rp:1,levelsRequired:4,levelsRequiredWithCoopertition:3,condition:"Threshold must be met on EACH required level, not across levels combined; alliance achievement."},barge:{rp:1,condition:"Alliance barge-point sum reaches selected event-profile threshold."},eventProfiles:{regionalAndDistrict:{coralPerRequiredLevel:5,bargePoints:14,sourceRefs:["U"],pages:[1,4,28]},districtChampionship:{coralPerRequiredLevel:5,bargePoints:14,sourceRefs:["U"],pages:[1,4,28]},firstChampionship:{coralPerRequiredLevel:7,bargePoints:16,sourceRefs:["M","U"],manualPages:[50],updatePages:[1]}},selectedEventProfile:null,selectedEventProfileReason:"No specific event selected; do not silently use Championship thresholds for all 2025 events.",dedicatedAlgaeRp:!1,win:3,tie:1,coopertition:{algaePerProcessor:2,bothProcessorsRequired:!0,coopertitionPointsPerTeam:1,isRankingPoint:!1},versionWarning:"Final M p.50 shows 7/16 after TU21. TU21 raises FIRST Championship only; TU18 explicitly retains District Championship thresholds. Old/new redline 5->7 and 14->16 is not a combined requirement.",bargeExamples:[{actions:["shallow","shallow","park"],points:14,ordinaryThresholdMet:!0,championshipThresholdMet:!1},{actions:["deep","park","park"],points:16,ordinaryThresholdMet:!0,championshipThresholdMet:!0}]}},dimensionsMm:{inchToMm:25.4,interpretation:"Exact imperial-to-mm conversions of nominal references, not measured precision. No field-height entry is automatically a manipulator-center target.",coral:{length:301.625,outsideDiameter:114.3,nominalInsideDiameter:101.6,sourceInches:{length:11.875,outsideDiameter:4.5,nominalInsideDiameter:4},sourceRefs:["M"],pages:[33],dimensionalTolerance:null,reason:"Manual nominal foam-core Schedule 40 PVC; no measured tolerance/ovality or guaranteed bore fit established."},algae:{diameter:412.75,diameterTolerance:6.35,minimumDiameter:406.4,maximumDiameter:419.1,sourceInches:{diameter:16.25,diameterTolerance:.25,minimumDiameter:16,maximumDiameter:16.5},sourceRefs:["M"],pages:[34],note:"Inflated gauge size; shape, wall thickness and weight distribution vary. Not necessarily spherical."},reef:{sourceRefs:["M"],pages:[23,24,45,46],L1:{height:457.2,sourceInches:{height:18},datum:"FIELD carpet",heightType:"top/front edge of trough; not a branch",toolCenterHeight:null,reason:"Scoring trajectory depends on trough surfaces, piece pose and tool geometry."},L2:{height:809.625,insetFromBase:41.275,sourceInches:{height:31.875,insetFromBase:1.625},datum:"FIELD carpet",heightType:"highest branch point",branchUpAngleDegrees:35,toolCenterHeight:null,reason:"Branch tip is not coral center or insertion trajectory."},L3:{height:1209.675,insetFromBase:41.275,sourceInches:{height:47.625,insetFromBase:1.625},datum:"FIELD carpet",heightType:"highest branch point",branchUpAngleDegrees:35,toolCenterHeight:null,reason:"Branch tip is not coral center or insertion trajectory."},L4:{height:1828.8,insetFromBase:28.575,sourceInches:{height:72,insetFromBase:1.125},datum:"FIELD carpet",heightType:"highest point of vertical branch",toolCenterHeight:null,reason:"Tool/piece clearance and placement path are not established by branch height."},pipePairSpacing:330.2,sourceInches:{pipePairSpacing:13},pipePairSpacingType:"Vertical pipes on same reef face, center to center.",algaeLow:{centerHeight:null,datum:"FIELD carpet",heightType:"requested ball center, unverified",reason:"M pp.45-46 stages algae on branch pairs; extracted figure/body text gives no numerical ball-center height. Cannot use L2 tip height or add a radius to it."},algaeHigh:{centerHeight:null,datum:"FIELD carpet",heightType:"requested ball center, unverified",reason:"M pp.45-46 gives no numerical ball-center height; no figure measurement or assumed L3-tip equivalence."},stagedAlgaeContactsCoralOnL4:!1},coralStation:{openingWidth:1930.4,openingHeight:177.8,openingBottomHeight:952.5,sourceInches:{openingWidth:76,openingHeight:7,openingBottomHeight:37.5},chuteSlopeDegrees:55,datum:"FIELD carpet",heightType:"bottom edge of opening",toolCenterHeight:null,reason:"Opening bottom is not fed coral axis; receiving pose depends on chute and tool geometry.",sourceRefs:["M"],pages:[32]},processor:{openingWidth:711.2,openingHeight:508,openingClearance:177.8,sourceInches:{openingWidth:28,openingHeight:20,openingClearance:7},datum:"FIELD carpet",heightType:"opening-to-carpet distance; specific edge not named in prose",openingBottomHeight:null,openingCenterHeight:null,toolCenterHeight:null,reason:"M p.28 says opening is 7 in from carpet but does not explicitly name the edge. Preserve clearance reference; do not promote to verified bottom/center or release pose without drawing confirmation.",sourceRefs:["M"],pages:[28]},net:{meshWidth:1219.2,meshLength:3657.6,lowestMeshHeight:1930.4,sourceInches:{meshWidth:48,meshLength:144,lowestMeshHeight:76},datum:"FIELD carpet",heightType:"lowest hanging mesh point, NOT rim/opening",rimOrOpeningHeight:null,toolReleaseHeight:null,reason:"M p.27 supplies lowest point only. Mesh dimensions are not a solved aperture or ballistic target. No net contact is allowed.",sourceRefs:["M"],pages:[27]},cage:{deepBottomHeight:79.375,shallowBottomHeight:765.175,bodyHeight:609.6,outsideWidth:187.325,sourceInches:{deepBottomHeight:3.125,shallowBottomHeight:30.125,bodyHeight:24,outsideWidth:7.375},datum:"FIELD carpet",heightType:"bottom of suspended cage, NOT hook contact",deepHookTargetHeight:null,shallowHookTargetHeight:null,reason:"Engagement geometry, ANCHOR exclusion and clearance/load path require separate design evidence; do not add body height to invent a legal hook point.",sourceRefs:["M"],pages:[26,46,49,69]},floorIdealizations:{coralHorizontalAxisHeight:57.15,algaeNominalCenterHeight:206.375,algaeMinimumCenterHeight:203.2,algaeMaximumCenterHeight:209.55,derivation:"Half OD for horizontal cylindrical coral; half diameter for spherical algae on an ideal flat plane. Derived, not independently specified field targets.",limitations:"No carpet sink, deformation, roller compression or tool-center prescription. Initial marked algae is atop coral, not on bare carpet.",sourceRefs:["M"],pages:[33,34,45]}},constraints:{analysisBoundary:"Read-only cached official PDF extraction and existing local reports. Only GAME-ANALYSIS.md and game.json written. No network, credentials, authenticated API, CAD/browser CAD, team-CAD downloads, kernels, simulations, ranking discovery, commits or delegates.",startingPerimeterMaximumMm:3048,startingHeightMaximumMm:1066.8,extensionMaximumMm:457.2,sourceInches:{startingPerimeterMaximumMm:120,startingHeightMaximumMm:42,extensionMaximumMm:18},envelopeDatum:"Fixed non-articulated ROBOT PERIMETER, taut-string outline in starting configuration excluding bumpers; not bumper face or a recess-following path. R101-R105 pp.77-78.",startingOverhang:"No robot hardware beyond perimeter projection except bumpers and stated minor protrusions.",multiSideExtensionAllowed:!0,postStartHeightMaximumMm:null,postStartHeightReason:"No rule height cap after start, per Q18; not an unlimited safe operating clearance. NET, venue, transport and safety limits remain.",heldCoralIncludedInExtensionMeasurement:!1,heldCoralCaveat:"Q144 exclusion from R105 does not remove controlled-piece hazards/contact restrictions; no corresponding algae measurement exclusion is asserted here.",robotMass:{maximumLb:115,maximumKg:52.16312255,sourceRefs:["M"],pages:[78]},robotWithBumpersMass:{maximumLb:135,maximumKg:61.23496995,sourceRefs:["M"],pages:[88]},massBasis:"R103 excludes bumpers, battery plus specified connection/cable assembly, and event-provided location tags. R408 adds bumpers on the R103 basis; not a separate 20 lb bumper limit.",bumpers:{intactPerimeterRequired:!0,intakeSizedGapAllowed:!1,adjacentSegmentGapExclusiveMaximumMm:31.75,zoneLowerMm:63.5,zoneUpperMm:146.05,sourceInches:{adjacentSegmentGapExclusiveMaximumMm:1.25,zoneLowerMm:2.5,zoneUpperMm:5.75},condition:"Filled corners; padding supported by backing fills nominal floor zone. Check configurations, not just stow. Do not consume inspection tolerance as design clearance. R401/R405; existing bounded bumper packet supplies broader construction context.",sourceRefs:["M"],pages:[84,86,87]},occupancy:{maximumCoral:1,maximumAlgae:1,simultaneousOneOfEachPermitted:!0,mechanicallyRequired:!1,scope:"Whole-robot direct/transitive CONTROL including supported/stuck pieces and deliberate herding. Shared-tool handoff does not create a second coral allowance. Limited L1 scored-coral pushing exception only.",rule:"G409",sourceRefs:["M"],pages:[66,67]},guards:[{id:"coralLaunch",rule:"G412",pages:[67],condition:"Launch coral only with bumpers partly in own REEF ZONE; do not treat approximate short reverse-intake guidance as a universal distance/speed allowance."},{id:"fieldBoundary",rule:"G407",pages:[66],condition:"No intentional out-of-field ejection of either piece, including via ricochet, except algae through PROCESSOR; applies to jam clearing."},{id:"protectedZones",rule:"G427",pages:[72],condition:"No direct or scoring-element-mediated opponent contact when opponent is partly/wholly within their own REEF/BARGE ZONE, regardless of initiator."},{id:"cageProtection",rule:"G428",pages:[72],lastTeleopSeconds:20,condition:"No direct/piece-mediated contact with opponent contacting their cage during final 20 s, regardless of initiator; this is protection timing, not a prescribed climb duration."},{id:"autoContact",rule:"G403",pages:[65],condition:"After bumpers completely cross BARGE ZONE away from own starting line, no direct or controlled-piece-mediated opponent contact in AUTO, regardless of initiator."},{id:"fieldAndClimbContact",rule:"G405/G417-G420",pages:[65,69],condition:"No opponent cage contact in AUTO/TELEOP; no NET contact or contact with algae scored in opponent NET; no prohibited field attachment outside cage exception; ANCHORS off limits except G419 inconsequential exception, which is not design permission."},{id:"opponentPlay",rule:"G410/G411/G421-G424",pages:[67,70,71],condition:"Do not de-score opponent coral or deliberately place algae on their reef. At most one robot beyond BARGE ZONES on opponent side; respect extended-contact, damage, tipping and entanglement restrictions."},{id:"stateMachine",rule:"Derived design guard, not a new rule",pages:[66,67,78],condition:"Independent coral/algae occupancy, shared-tool ownership, positive transfer confirmation, release-location checking, full swept-extension limits and climb/stow interlock. Unknown occupancy/location inhibits acquisition/launch pending controlled recovery."}],shop:{accurateMetalBendsAvailable:!1,preferredConstruction:["router-cut flat aluminum plates","router-cut polycarbonate","spacers and tubes","manual machining","printed guides"],basis:"User shop constraint, not game rule. Preserve service/electrical volume and intact removable bumpers; redesign bend-dependent reference details."},conceptContract:{count:10,eachRequires:["complete coral acquisition-retention-scoring route","complete algae acquisition-retention-scoring route","explicit deep/shallow/park plan","stow and transition hypotheses","intact bumpers and service space"],permittedIntentionalOmissions:["L4","net","deep climb","simultaneous mechanical carry"],unknownHeightPolicy:"Never coerce null into a numeric field guide/tool target or substitute branch-tip/lowest-net heights. Proposed manipulator-center poses must be separately labeled design hypotheses."},unmeasured:{cycleTimesSeconds:null,successProbabilities:null,manipulatorTrajectories:null,climbLoads:null,stability:null,reason:"No physical measurements, mechanism proof or simulation in this bounded task."}},strategyNotes:[{id:"reefAccess",type:"evidence_plus_inference",sourceRefs:["M"],pages:[45,46,48],text:"Algae on branch pairs obstructs access; coral touching algae cannot score on L2-L4. Removal may unlock own/partner cycles but gives no removal points. Staged algae does not contact L4 coral; do not treat all reef access as blocked."},{id:"floorAndStation",type:"design_implication",sourceRefs:["M"],pages:[32,45],text:"Separate station receiving, horizontal loose coral, loose algae and initially stacked algae-on-coral cases. Source geometry is not a tool center. Multiple feeds/retained pieces must obey whole-robot occupancy."},{id:"familySeparate",type:"conditional_recommendation",family:"Elevator plus separate algae mechanism",capabilityIntent:"L2-L4 coral and independent algae clearing; processor baseline; net/deep optional.",condition:"Repeated high coral placement and task independence justify separate mechanisms.",firstCheck:"Stow, intact-bumper floor transfer, shared reef approach, service space and cage load-path packaging.",sourceRefs:["R1690_1778","R2056_6328","R2056_BINDER"]},{id:"familyShared",type:"conditional_recommendation",family:"Shared articulated arm or elevator/wrist with dual-purpose tool",capabilityIntent:"Coral and algae processor; optional L4/net; explicit climb choice. Simultaneous carrying not assumed.",condition:"Avoiding handoffs/duplicate mechanisms outweighs serialized tasks and tool compromises.",firstCheck:"Demonstrate both-piece retention/release and exclusive tool ownership through reconfiguration.",sourceRefs:["R2910","R1690_1778"]},{id:"familyLow",type:"conditional_recommendation",family:"Lower-reach coral plus independent algae roller and climb",capabilityIntent:"L1-L3 coral, algae processor and explicit deep/shallow/park plan; deliberately omit L4/net.",condition:"Measured lower-level throughput and alliance complementarity outweigh added reach/shooting capability.",firstCheck:"Verify low/high reef-algae capability separately; climb time/load-path budget; simplicity is not measured reliability.",sourceRefs:["M","R2056_BINDER"]},{id:"referenceLimits",type:"evidence_boundary",text:"1690 over-bumper transfer, 1778 centering during raise, 2056 independent-side alignment and staged handoff, 6328 attributed inspiration, and 2910 arm-carried intake are principles from existing reports, not exact replicas or our performance. No new team research/CAD.",sourceRefs:["R1690_1778","R2056_6328","R2056_BINDER","R2910"]},{id:"tenConceptCoverage",type:"design_direction",text:"Vary functional ownership, station/floor source, orientation/handoff, scoring omissions and climb packaging across ten concepts. Each handles both pieces; do not produce ten cosmetic rearrangements or silently assume missing heights."},{id:"autoValue",type:"arithmetic_not_performance",sourceRefs:["M"],pages:[48,50],autoPremiumByCoralLevel:{L1:1,L2:1,L3:2,L4:2},example:{condition:"One qualifying retained AUTO L4 coral and LEAVE",points:10},text:"No AUTO+TELEOP double count. AUTO RP depends on partners' LEAVE and at least one alliance coral; coordinate baseline before adding autonomous complexity."},{id:"coralBreakEven",type:"conditional_expected_value",formula:"5*p4/t4 > 4*p3/t3",variables:"p4,p3: unmeasured success probabilities; t4,t3: cycle seconds, including travel/handling.",equalProbabilityTimeRatioBoundary:1.25,hypotheticalExample:{l3Seconds:10,l4EqualitySeconds:12.5},limitations:"Not measured times or predicted scores; excludes penalties, access conflicts and RP threshold value."},{id:"algaeBreakEven",type:"conditional_expected_score_margin",processorFormula:"pProcessor*(6-4*h)",netFormula:"4*pNet",variables:"h is probability a successfully processor-delivered ball later scores in opponent net; pProcessor and pNet are own robot delivery probabilities. All unmeasured.",hypotheticalEqualTimeGuaranteedRobotSuccessBoundaryH:.5,limitations:"Immediate one-ball comparison only. Compare rates if times differ. Excludes reef-clearing value, Coopertition, other HP recirculation effects and future possession."},{id:"climbBreakEven",type:"conditional_expected_value",formula:"p*C+(1-p)*f > 2+r*t",variables:"C=12 deep or 6 shallow; f=failure points; t=incremental seconds versus park; r=forgone expected scoring points/s; p unmeasured.",hypotheticalExample:{incrementalSeconds:12,forgonePointsPerSecond:.4,failurePointsAssumed:2,deepStrictProbabilityThreshold:.48,shallowStrictProbabilityThreshold:1.2},limitations:"Example assumes a failed attempt still qualifies for park; not guaranteed. f=0 changes threshold. No invented climb reliability. BARGE RP and penalties excluded; RP-critical climb can change decision."},{id:"clearingBreakEven",type:"conditional_expected_value",text:"Clear algae when expected incremental own/partner coral value plus algae-destination value exceeds forgone alternative and risk. Do not award fixed invented clearing points or count a partner cycle twice."},{id:"evidenceGaps",type:"unverified",text:"Low/high reef-algae center heights, net rim/opening height, processor edge-specific height, hook engagement/ANCHOR clearances, all manipulator-center paths, unspecified tolerances, carpet compression, performance, reach, loads and stability remain unverified. Resolve only in a separately authorized next stage; no guessed reef geometry."}]};var Kt=Hi.dimensionsMm,tt={carpet:14080471,boundary:16119021,body:10132891,edge:6844011,pipe:8291715,coral:15131607,algae:6140330,provisional:11824181},Sr="Geometry mates and contact are unverified; no reach, scoring, inspection or load-path proof. No source CAD copied or measured.";function Oo(i,e){return`game.json; ${i.sourceRefs.map(n=>Hi.sources.find(r=>r.id===n)).map(n=>`${n.id}: ${n.url}`).join("; ")}; pp. ${i.pages.join(", ")}. ${e}`}function Kn(i,e,t={}){let n=new pt;return n.name=e,n.userData=t,i.add(n),n}function Wd(i,e,t,n,r=[0,0,0]){let s=new Ci(new ns(t),new wn({color:n}));return t.dispose(),s.name=e,s.position.set(...r),i.add(s),s}function ko(i,e,t,n,r){let[s,a,o]=t,[l,c]=n,h=[[s,a,o],[l,a,o],[l,c,o],[s,c,o],[s,a,o]],d=new Dn(new Et().setFromPoints(h.map(u=>new T(...u))),new wn({color:r}));return d.name=e,i.add(d),d}function Iy(i){let e=Kn(i,"Local carpet patch",{role:"carpet",approx:{widthMm:1600,lengthMm:2500,thicknessMm:2,boundary:"Crop boundary only, not an official field or scoring-zone boundary."}});Ke(e,"Carpet surface",[0,250,-1],[1600,2500,2],tt.carpet),ko(e,"Context crop boundary",[-798,-998,.5],[798,1498,.5],tt.boundary)}function Xd(i,e,t,n,r){let s=Kn(i,e,{side:n?"rear":"front",approx:{...r,placementXmm:t,faceYmm:n?1320:-620,placement:"Fixed illustrative approach distance, not solved contact."}});return s.position.set(t,n?1320:-620,0),s.rotation.z=n?Math.PI:0,s}function Dy(i,e){let t=i.getObjectByName("Nominal coral");return t?t.getWorldPosition(new T).x:e.coralX}function Ny(i,e,t){let n=Kn(i,"Loose floor pickup context",{role:"pickup",suppressedPieces:[],approx:{frontYmm:-490,rearYmm:1140,piecePlacement:"Illustrative loose pickup, not initially staged algae on coral."}});if(e.getObjectByName("Nominal coral"))n.userData.suppressedPieces.push("coral");else{let r=Kt.coral,s=on(n,"Loose floor coral",new Sn(r.outsideDiameter/2,r.outsideDiameter/2,r.length,32,1,!0),tt.coral,[t.coralX,t.coral==="rearArm"?1140:-490,Kt.floorIdealizations.coralHorizontalAxisHeight]);s.rotation.z=Math.PI/2,s.userData={role:"loosePiece",piece:"coral"};for(let a of[-1,1]){let o=on(s,"Loose coral rim",new qn(r.nominalInsideDiameter/2,r.outsideDiameter/2,32),tt.coral,[0,a*r.length/2,0]);o.rotation.x=a*Math.PI/2}}e.getObjectByName("Nominal algae")?n.userData.suppressedPieces.push("algae"):on(n,"Loose floor algae",new En(Kt.algae.diameter/2,24,16),tt.algae,[t.algaeX,-490,Kt.floorIdealizations.algaeNominalCenterHeight]).userData={role:"loosePiece",piece:"algae"}}function Uy(i,e){e.updateWorldMatrix(!0,!0);let t=new Yt;if(e.traverse(o=>{["Chassis side rail","Chassis cross rail"].includes(o.name)&&t.union(new Yt().setFromObject(o,!0))}),t.isEmpty())throw new Error("Stow context requires the model chassis rails");let n=t.getSize(new T),r=t.getCenter(new T),s=Hi.constraints.startingHeightMaximumMm,a=Kn(i,"Starting envelope guide",{role:"stowGuide",official:{heightMm:s,perimeterMaximumMm:Hi.constraints.startingPerimeterMaximumMm},approx:{widthMm:n.x,lengthMm:n.y,footprint:"Visible fixed chassis-rail bounds from models.mjs, excluding bumpers; not a verified taut-string ROBOT PERIMETER."}});Wd(a,"Starting height guide edges",new In(n.x,n.y,s),tt.edge,[r.x,r.y,s/2]),ko(a,"Model chassis footprint",[t.min.x,t.min.y,0],[t.max.x,t.max.y,0],tt.edge)}function Fy(i,e){let t=Kt.coralStation,n=e.coral==="rearArm"||["R01","R03","R05"].includes(e.id),r=170,s=Xd(i,"Cropped coral station",e.coralX,n,{shownWidthMm:600,chuteRunMm:r,wallHeightMm:100,frameThicknessMm:20,profile:"Chute depth, supports and crop edges are illustrative, not station CAD."});s.userData.official={openingWidthMm:t.openingWidth,openingHeightMm:t.openingHeight,openingBottomMm:t.openingBottomHeight,chuteSlopeDegrees:t.chuteSlopeDegrees},s.userData.cropped={shownWidthMm:600,fullOpeningWidthMm:t.openingWidth,note:"Central 600 mm segment; side edges are crop markers, not actual opening jambs."};let a=t.openingBottomHeight,o=a+t.openingHeight,l=Kn(s,"Station frame",{role:"fieldSupport"});for(let u of[-330,330])qe(l,"Illustrative station post",[u,-55,0],[u,-55,o+60],30,30,tt.edge);let c=Ke(l,"Opening bottom sill",[0,-10,a-10],[600,20,20],tt.body);c.userData={datum:"top edge",heightMm:a};let h=Ke(l,"Opening top lintel",[0,-10,o+10],[600,20,20],tt.body);h.userData={datum:"bottom edge",heightMm:o},ko(s,"Cropped opening edges",[-300,a,0],[300,o,0],tt.edge).rotation.x=Math.PI/2;let d=r*Math.tan(Ct.degToRad(t.chuteSlopeDegrees));qe(l,"Sloped station trough",[0,-r,a+d],[0,0,a],600,8,tt.body);for(let u of[-300,300])Jt(l,"Illustrative chute side",u,[[-r,a+d],[-r,a+d+100],[0,a+100],[0,a]],6,tt.edge)}function Oy(i,e,t,n){let r=Kt.reef,s=n==="coral"?Dy(e,t)+r.pipePairSpacing/2:t.algaeX,a=Xd(i,"Reef face section",s,n==="coral"&&t.coral==="rearArm",{faceWidthMm:720,baseDepthMm:180,baseProfile:"Illustrative face, ribs and trough cross-section; official base profile is unknown.",branchLengthMm:310,pipeRadiusMm:21,branchTipLocalYmm:210,verticalBranchLengthMm:250,cantilever:"Illustrative lengths and stand-off, outside the bumper; not a solved insertion path."});a.userData.official={pipePairSpacingMm:r.pipePairSpacing,heightsMm:Object.fromEntries(["L1","L2","L3","L4"].map(c=>[c,r[c].height])),datum:"FIELD carpet; L1 top/front trough edge; L2/L3 highest angled branch points; L4 highest vertical branch point. None is a gripper target."};let o=Kn(a,"Illustrative reef body",{role:"fieldSupport"});Ke(o,"Reef base foot",[0,-90,20],[760,180,40],tt.edge),Ke(o,"Reef face backing",[0,-155,235],[720,12,350],tt.body);for(let c of[-350,350])Jt(o,"Illustrative reef base profile",c,[[-175,40],[-175,420],[-65,r.L1.height],[0,120],[0,40]],10,tt.edge);let l=Kn(a,"L1 trough",{role:"cantilever",official:{frontEdgeHeightMm:r.L1.height},approx:{bedStartHeightMm:350,bedEndHeightMm:420,lipThicknessMm:12}});qe(l,"Sloping trough bed",[0,-95,350],[0,140,420],720,8,tt.body),Ke(l,"L1 front trough edge",[0,140,r.L1.height-6],[720,16,12],tt.edge),Ke(l,"Trough rear lip",[0,-95,r.L1.height-6],[720,16,12],tt.edge);for(let c of[-355,355])Jt(l,"Trough end cheek",c,[[-95,350],[140,420],[140,r.L1.height],[-95,r.L1.height]],8,tt.body);for(let[c,h]of[-r.pipePairSpacing/2,r.pipePairSpacing/2].entries()){Ve(o,"Vertical reef pipe",[h,-80,45],[h,-80,r.L4.height-400],21,tt.pipe);for(let u of["L2","L3"]){let f=Ct.degToRad(r[u].branchUpAngleDegrees),g=[h,210,r[u].height-21*Math.cos(f)],y=[h,g[1]-310*Math.cos(f),g[2]-310*Math.sin(f)];Ve(a,`${u} illustrative collar ${c+1}`,[h,-80,y[2]],y,21,tt.pipe).userData={role:"cantilever",approx:{length:"Derived from illustrative stand-off, not sourced."}};let m=Ve(a,`${u} branch ${c+1}`,y,g,21,tt.pipe);m.userData={role:"branch",level:u,official:{highestPointMm:r[u].height,upAngleDegrees:r[u].branchUpAngleDegrees},approx:{lengthMm:310,radiusMm:21}}}Ve(a,`L4 illustrative cantilever ${c+1}`,[h,-80,r.L4.height-400],[h,210,r.L4.height-250],21,tt.pipe).userData={role:"cantilever",approx:{profile:"Illustrative support, not official branch geometry."}};let d=Ve(a,`L4 branch ${c+1}`,[h,210,r.L4.height-250],[h,210,r.L4.height],21,tt.pipe);d.userData={role:"branch",level:"L4",official:{highestPointMm:r.L4.height},approx:{lengthMm:250,radiusMm:21}}}if(n==="algae"){let c=t.algae==="shortArm",h=c?1e3:1500,d=Wd(a,"Provisional reef algae marker",new En(Kt.algae.diameter/2,16,10),tt.provisional,[0,210,h]);d.userData={role:"provisionalMarker",isScoringPiece:!1,band:c?"low":"high",officialCenterHeightMm:(c?r.algaeLow:r.algaeHigh).centerHeight,officialDiameterMm:Kt.algae.diameter,approx:{centerHeightMm:h,note:"Provisional center only, not a numerical official height or an additional held ball."}}}}function ky(i,e){if(e.climb==="park"){let l=ko(i,"Illustrative park-area crop",[-500,950,.5],[500,1400,.5],tt.edge);l.userData={role:"parkGuide",approx:{widthMm:1e3,lengthMm:450,note:"Local cue only, not the official BARGE ZONE boundary or verified PARK."}};return}let t=Kt.cage,n=e.climb==="deep"?t.deepBottomHeight:t.shallowBottomHeight,r=n+t.bodyHeight,s=t.outsideWidth/2,a=Kn(i,`${e.climb} cage body`,{role:"cageBody",official:{bottomHeightMm:n,bodyHeightMm:t.bodyHeight,outsideWidthMm:t.outsideWidth,hookTargetHeightMm:e.climb==="deep"?t.deepHookTargetHeight:t.shallowHookTargetHeight},approx:{centerYmm:1385,depthMm:160,topWidthMm:140,topDepthMm:110,barThicknessMm:16,profile:"Illustrative taper and bar layout; fixed carpet datum, not fitted to a hook."}});a.position.y=1385;for(let[l,c,h,d]of[["Lower",t.outsideWidth,160,n+8],["Upper",140,110,r-8]])for(let u of[-1,1])Ke(a,`${l} cage crossbar`,[0,u*(h/2-8),d],[c,16,16],tt.edge),Ke(a,`${l} cage side bar`,[u*(c/2-8),0,d],[16,h-32,16],tt.edge);for(let l of[-1,1])for(let c of[-1,1])Ve(a,"Sloping cage bar",[l*(s-8),c*72,n+16],[l*62,c*47,r-16],8,tt.pipe);let o=Kn(i,"Illustrative cage backdrop support",{role:"fieldSupport",approx:{heightMm:2200,postYmm:1460,note:"Cropped illustrative support, disconnected from cage; actual suspension and load path are not modeled."}});for(let l of[-300,300])qe(o,"Backdrop support post",[l,1460,0],[l,1460,2200],30,30,tt.body);Ke(o,"Backdrop support crossmember",[0,1460,2185],[630,30,30],tt.body)}function qd(i,e,t){if(!i?.isObject3D||!e||!["travel","stow","floor","station","coral","algae","climb"].includes(t))throw new Error("Field context requires a robot model, recipe and known pose");let n=new pt;return n.name=`${e.id} ${t} field context`,n.userData={title:"",note:"",source:"",provenContact:!1,pose:t},t==="travel"?(Object.assign(n.userData,{title:"Isolated mechanism",note:`isolated; no field context. ${Sr}`,source:"No field dimensions used; existing mechanism model only."}),n):t==="stow"?(Uy(n,i),Object.assign(n.userData,{title:"Collapsed envelope reference",note:`Edges only; footprint follows the model chassis rails, not a certified starting outline. ${Sr}`,source:`game.json constraints, R101-R105 pp.77-78; starting height ${Hi.constraints.startingHeightMaximumMm} mm and maximum perimeter ${Hi.constraints.startingPerimeterMaximumMm} mm. XY outline derived from models.mjs, not an official rectangle.`}),n):(Iy(n),t==="floor"?(Ny(n,i,e),Object.assign(n.userData,{title:"Floor pickup approach",note:`Local carpet crop; loose pieces only when that type is absent from the robot. Ideal undeformed geometry, not a second held piece or initial algae-on-coral staging. ${Sr}`,source:Oo(Kt.floorIdealizations,"Floor centers derived from half nominal diameter, not tool centers; coral/algae sizes from dimensionsMm.")})):t==="station"?(Fy(n,e),Object.assign(n.userData,{title:"Coral station approach",note:`Cropped central 600 mm of the ${Kt.coralStation.openingWidth} mm opening; crop edges are not actual jambs. Chute depth, side profile and supports illustrative. Approach gap is not a feed/contact solution. ${Sr}`,source:Oo(Kt.coralStation,"Opening bottom, opening height/width and chute slope only; opening bottom is not a fed coral axis.")})):t==="coral"||t==="algae"?(Oy(n,i,e,t),Object.assign(n.userData,{title:t==="coral"?"Reef approach":`${e.algae==="shortArm"?"Low":"High"} reef-algae approach`,note:`One reef face with L1 trough and paired branches. Base profile, branch lengths and cantilever stand-off are illustrative; gap is intentional, not verified scoring.${t==="algae"?" Rust wire marker is a provisional removal location, not another ball; numerical official algae center is unknown. No net or processor target is implied.":""} ${Sr}`,source:Oo(Kt.reef,"L1 is the top/front trough edge; L2/L3/L4 are highest branch points, not gripper centers. Pipe-pair spacing is center to center; algae center heights remain null.")})):(ky(n,e),Object.assign(n.userData,{title:e.climb==="park"?"Barge park approach":`${e.climb==="deep"?"Deep":"Shallow"} cage approach`,note:`${e.climb==="park"?"Illustrative park-area crop; no cage for this recipe.":"Cage remains at the official bottom datum, with a visible approach gap. Taper, depth, bars and disconnected backdrop support are illustrative; actual suspension is omitted. No hook target height is known."} ${Sr}`,source:e.climb==="park"?"game.json scoring.criteria.park; M p.49. Bumper overlap criterion only; local outline is not an official zone boundary.":Oo(Kt.cage,"Bottom of suspended cage, body height and outside width only; neither bottom nor top is a hook engagement target.")})),n)}var xt={season:2025,schemaVersion:1,reviewedOn:"2026-09-13",units:{length:"mm",angle:"deg",inchToMm:25.4},evidencePolicy:{verified:"Supplied nominal datums are supported by cited text, dimension arrows, or explicit arithmetic. Not measured field accuracy or a solved robot interaction.",mixed:"Contains verified references alongside explicit unknowns or engineering hypotheses. Consult verifiedFields, unknownFields and assumedFields.",assumed:"The requested target is an engineering hypothesis, not an authoritative field dimension.",null:"Unknown. Never coerce to zero or substitute an unrelated datum.",hypothesis:"Only explicitly named Hypothesis fields may supply illustrative fallback geometry. Their source is unknown; using one makes the interaction assumed.",precedence:"Use final English manual imperial nominal values for shared datums. Preserve drawing differences separately; do not splice different endpoints or reference frames into an exact model."},sources:{M:{url:"https://firstfrc.blob.core.windows.net/frc2025/Manual/2025GameManual.pdf",cacheFile:"../../../research/2025-coral/.cache/rules/manual.pdf",sha256:"dc6aa9ddbeba25c679c58bae746bde14dba2af79a61a65d8c5f575ca6cdfd523",pageCount:164,figurePagesInspected:[23,24,25,26,27,28,32,45,46],additionalTextPagesInspected:[33,34],version:"ARENA V4; Game Details V13; cached final English manual dated 2025-04-08. Printed pages equal PDF pages."},D:{url:"https://firstfrc.blob.core.windows.net/frc2025/FieldAssets/2025FieldDrawings.pdf",discoveredAt:"https://www.firstinspires.org/resources/library/frc/archived-games",cacheFile:"../../../.cache/interaction-field/2025FieldDrawings.pdf",sha256:"85659c846ec94909d399ed0b29c9ea0a2fbb57dd8e21f77eaf613fcdd5401015",pageCount:215,figurePagesInspected:[91,125,143,157,162,163,164],additionalTextPagesInspected:[1,2,3,90,124,144,145,161],scope:"One public drawing PDF; sheet labels indexed, selected sheets read. No CAD archive, image scaling, or exhaustive assembly reconstruction.",locators:{processor:"PDF p.91, GE-25100 sheet 2/2, 2024-10-28",barge:"PDF p.125, GE-25200 sheet 3/3, 2024-12-16",netTube:"PDF p.143, GE-25215 sheet 1/1, 2024-12-16",net:"PDF p.157, GE-25228 sheet 1/1, 2024-12-16",reef:"PDF p.162, GE-25300 sheet 2/2, 2024-12-06",scoringPipe:"PDF p.163, GE-25301 rev D, sheet 1/1, last revision 2025-02-18",smallScoringPipe:"PDF p.164, GE-25301-01 rev B, sheet 1/1, 2024-05-03"}}},sceneContract:{heightDatum:"FIELD carpet, z = 0; all height datums remain fixed across robots.",localAxes:"Right-handed task-local frame: x lateral along interface; y outward toward approaching robot; z up. Not official full-field coordinates.",reefOrigin:"On carpet at midpoint of selected reef base face; y = 0 at outer base face, negative y into reef. Positive-x branch is the reference branch; mirror x for its partner.",openingOrigin:"On carpet beneath midpoint of the station or processor opening; y = 0 at field-facing opening plane.",netOrigin:"On carpet beneath the selected net center; x along long rails, y across the net toward the approaching robot. Clear-aperture origin remains an idealization.",fieldFixed:!0,robotApproachTranslationOnly:!0,robotApproachAxes:["x","y"],robotBaseZMm:0,fitFieldHeightToTool:!1,fitFieldScaleToRobot:!1,hypothesesFixedAcrossRobots:!0,contactAndReachVerified:!1,requirements:["Instantiate the requested task interface, full-size piece and actual mechanism pose together; a generic nearby reef/station/net is insufficient.","Keep selected field pose and robot heading fixed; approach alignment translates the robot on carpet only. Mechanism articulation is separate and must not move field targets.","Use real tool and piece datums to report remaining position/orientation error. Unreachable targets remain unreachable; do not vertically translate the chassis or field.","Show one physical configuration per view. Assumed contact, insertion, feeding or release remains labeled assumed, even when some field dimensions are verified.","L1 needs trough contact; L2/L3 need an inclined capped branch and coral bore insertion; L4 needs vertical placement and the compound supporting pipe.","Station needs the opening and descending chute plus receiving piece; processor needs the opening, lip and outgoing ball; net needs rails, end panels and sagging mesh, not a box at the mesh minimum.","Low/high algae removal needs the appropriate branch pair and staged ball; loose floor coral, loose floor algae and initial algae-on-upright-coral are different tasks.","Static alignment does not prove swept clearance, retention, scoring, strength, stability, ballistics, rules compliance or cycle performance."]},pieces:{coral:{status:"verified",assumedFields:[],source:"M section 5.7.1 p.33; nominal imperial dimensions, not guaranteed bore fit.",lengthMm:301.625,outsideDiameterMm:114.3,nominalInsideDiameterMm:101.6,sourceInches:{lengthMm:11.875,outsideDiameterMm:4.5,nominalInsideDiameterMm:4}},algae:{status:"verified",assumedFields:[],source:"M section 5.7.2 p.34; inflated gauge diameter, not guaranteed spherical geometry.",diameterMm:412.75,diameterToleranceMm:6.35,minimumDiameterMm:406.4,maximumDiameterMm:419.1,sourceInches:{diameterMm:16.25,diameterToleranceMm:.25,minimumDiameterMm:16,maximumDiameterMm:16.5}}},interfaces:{l1:{status:"mixed",source:"M p.23 section 5.3 and pp.23-24 Figures 5-6/5-7: front edge at 18 in; highlighted angled, vertical and top-edge trough surfaces. D p.162 GE-25300 gives a different nominal assembly edge, 17.88 in.",verifiedFields:["frontEdgeMm"],assumedFields:["troughDepthHypothesisMm","troughWidthHypothesisMm"],unknownFields:["troughDepthMm","troughWidthMm","troughProfileMm"],frontEdgeMm:457.2,troughDepthMm:null,troughWidthMm:null,troughProfileMm:null,troughDepthHypothesisMm:200,troughWidthHypothesisMm:900,hypothesisSource:"unknown",sourceInches:{frontEdgeMm:18},note:"L1 is not a branch. A trough bounding box or its front-edge height alone does not establish a scoring/contact pose. Hypothesis dimensions are independent sketch choices, not measured from Figure 5-7."},l2:{status:"mixed",source:"M p.24 section 5.3: 31 7/8 in highest branch point, 1 5/8 in inset, 35 deg upward, 13 in pipe-pair centers. D p.164 GE-25301-01 rev B explicitly dimensions OD 1.66 in; p.163 GE-25301 rev D shows capped welded branches at 55 deg to vertical.",verifiedFields:["tipHeightMm","upAngleDeg","branchRadiusMm","branchOutsideDiameterMm","tipInsetFromBaseMm","pairSpacingMm","componentMaxLengthMm"],assumedFields:["branchLengthHypothesisMm","tipCenterHypothesisMm"],unknownFields:["branchLengthMm","tipCenterMm"],tipHeightMm:809.625,upAngleDeg:35,branchRadiusMm:21.082,branchOutsideDiameterMm:42.164,tipInsetFromBaseMm:41.275,pairSpacingMm:330.2,branchLengthMm:null,branchLengthHypothesisMm:280,componentMaxLengthMm:304.8,tipCenterMm:null,tipCenterHypothesisMm:[165.1,-55,790],hypothesisSource:"unknown",sourceInches:{tipHeightMm:31.875,branchRadiusMm:.83,branchOutsideDiameterMm:1.66,tipInsetFromBaseMm:1.625,pairSpacingMm:13,componentMaxLengthMm:12},note:"tipHeightMm is the highest physical point, NOT the center of a cylindrical end face. Hypothesis center is a coarse capped-cylinder sketch, not exact field coordinates. branchLengthMm means usable straight protrusion tip-to-weld, unresolved here; the dimensioned 12 in maximum component length includes its coped attachment end and is not this length."},l3:{status:"mixed",source:"M p.24 section 5.3: 47 5/8 in highest branch point, 1 5/8 in inset, 35 deg upward, 13 in pipe-pair centers. D pp.163-164 GE-25301 rev D / GE-25301-01 rev B establishes the same small-pipe component as L2, OD 1.66 in.",verifiedFields:["tipHeightMm","upAngleDeg","branchRadiusMm","branchOutsideDiameterMm","tipInsetFromBaseMm","pairSpacingMm","componentMaxLengthMm"],assumedFields:["branchLengthHypothesisMm","tipCenterHypothesisMm"],unknownFields:["branchLengthMm","tipCenterMm"],tipHeightMm:1209.675,upAngleDeg:35,branchRadiusMm:21.082,branchOutsideDiameterMm:42.164,tipInsetFromBaseMm:41.275,pairSpacingMm:330.2,branchLengthMm:null,branchLengthHypothesisMm:280,componentMaxLengthMm:304.8,tipCenterMm:null,tipCenterHypothesisMm:[165.1,-55,1190],hypothesisSource:"unknown",sourceInches:{tipHeightMm:47.625,branchRadiusMm:.83,branchOutsideDiameterMm:1.66,tipInsetFromBaseMm:1.625,pairSpacingMm:13,componentMaxLengthMm:12},note:"Same tip-surface versus axis-center distinction as L2. The coarse hypothesis and 280 mm protrusion are not drawing dimensions; do not promote them to exact insertion targets."},l4:{status:"mixed",source:"M p.24 section 5.3: 72 in highest vertical branch point, 1 1/8 in inset, 13 in pipe-pair centers. D p.163 GE-25301 rev D specifies 1.25 in Schedule 40 steel for scoring pipes; p.164 documents that pipe specification's nominal 1.66 in OD. Radius is derived from the shared pipe specification, not a measured cap envelope.",verifiedFields:["tipHeightMm","upAngleDeg","branchRadiusMm","branchOutsideDiameterMm","tipInsetFromBaseMm","pairSpacingMm"],assumedFields:["branchLengthHypothesisMm","tipCenterHypothesisMm"],unknownFields:["branchLengthMm","tipCenterMm","compoundSupportPathMm"],tipHeightMm:1828.8,upAngleDeg:90,branchRadiusMm:21.082,branchOutsideDiameterMm:42.164,tipInsetFromBaseMm:28.575,pairSpacingMm:330.2,branchLengthMm:null,branchLengthHypothesisMm:180,tipCenterMm:null,tipCenterHypothesisMm:[165.1,-50,1828.8],compoundSupportPathMm:null,hypothesisSource:"unknown",sourceInches:{tipHeightMm:72,branchRadiusMm:.83,branchOutsideDiameterMm:1.66,tipInsetFromBaseMm:1.125,pairSpacingMm:13},note:"Vertical upper segment is real; lower compound bends must not be replaced by an inclined L2/L3 branch. Exposed straight length, cap/weld envelope and complete pipe centerline remain unresolved."},station:{status:"verified",source:"M p.32 section 5.6.2, Figure 5-18 side and field views: opening 76 x 7 in, bottom 37.5 in, chute descending 55 deg toward FIELD.",verifiedFields:["bottomMm","openingHeightMm","openingWidthMm","chuteAngleDeg","topMm"],assumedFields:[],unknownFields:[],bottomMm:952.5,openingHeightMm:177.8,openingWidthMm:1930.4,chuteAngleDeg:55,topMm:1130.3,sourceInches:{bottomMm:37.5,openingHeightMm:7,openingWidthMm:76,topMm:44.5},derivation:"topMm = bottomMm + openingHeightMm; chuteAngleDeg is downward from horizontal along feed direction.",note:"Verified opening datums do not specify coral axis, tool-center height, feed orientation, chute length or receiver offset. No assumption that a tilted coral must fit as a static vertical silhouette."},processor:{status:"verified",source:"M p.28 section 5.5 / Figure 5-13 plus D p.91 GE-25100 sheet 2/2: front-view arrows explicitly connect floor/base datum to the opening's lower straight edge with 7.00 in; 20.00 in spans lower to upper opening edge; width is 28.00 in.",verifiedFields:["bottomMm","openingWidthMm","openingHeightMm","topMm","centerMm"],assumedFields:[],unknownFields:[],bottomMm:177.8,openingWidthMm:711.2,openingHeightMm:508,topMm:685.8,centerMm:431.8,sourceInches:{bottomMm:7,openingWidthMm:28,openingHeightMm:20,topMm:27,centerMm:17},derivation:"topMm = bottomMm + openingHeightMm; centerMm = bottomMm + openingHeightMm / 2, geometric aperture center only.",note:"The 7 in dimension is the lower opening edge, not its center or sensor. Opening has rounded corners in the drawing; width/height are bounding dimensions, not a complete rectangular clearance guarantee. Ramp, lip, sensors, compression and release path still need checking."},net:{status:"mixed",source:"M p.27 section 5.4.2 / Figure 5-12: 48 x 144 in mesh and 76 in lowest mesh point. D p.125 GE-25200 sheet 3/3 separately dimensions side-rail/support levels 88.01 / 88.93 in, end-panel top 100.99 in and top-view outer span 41.16 in. D p.157 GE-25228 identifies 48 x 144 in as net material size, not clear aperture.",verifiedFields:["lowestMeshMm","meshWidthMm","meshLengthMm","sideRailDrawingHeightMm","sideSupportDrawingHeightMm","endPanelTopDrawingMm","outerWidthDrawingMm"],assumedFields:["rimHypothesisMm","openingWidthHypothesisMm","openingLengthHypothesisMm"],unknownFields:["rimMm","openingWidthMm","openingLengthMm","perimeterProfileMm"],rimMm:null,openingWidthMm:null,openingLengthMm:null,perimeterProfileMm:null,rimHypothesisMm:2260,openingWidthHypothesisMm:1e3,openingLengthHypothesisMm:3500,lowestMeshMm:1930.4,meshWidthMm:1219.2,meshLengthMm:3657.6,sideRailDrawingHeightMm:2235.454,sideSupportDrawingHeightMm:2258.822,endPanelTopDrawingMm:2565.146,outerWidthDrawingMm:1045.464,hypothesisSource:"unknown",sourceInches:{lowestMeshMm:76,meshWidthMm:48,meshLengthMm:144,sideRailDrawingHeightMm:88.01,sideSupportDrawingHeightMm:88.93,endPanelTopDrawingMm:100.99,outerWidthDrawingMm:41.16},note:"No unique horizontal mesh-rim plane or clear rectangular opening was established. 2260 mm is an assumed long-side entry reference rounded from the upper side-support envelope, NOT an all-sides rim or measured cord height. Retain the higher end panels. The assumed 1000 x 3500 mm aperture is a sketch choice, not a certified clear window. Never substitute 1930.4 mm or the unverified 98 in guess for rimMm."},algaeLow:{status:"assumed",source:"unknown; M pp.45-46 section 6.3.4.2 / Figure 6-3 verifies lower-pair staging, but no numeric ball-center height. D p.162 GE-25300 has no staged-ball center dimension.",verifiedFields:[],assumedFields:["centerHypothesisMm","normalOffsetHypothesisMm"],unknownFields:["centerMm","normalOffsetMm"],centerMm:null,centerHypothesisMm:900,normalOffsetMm:null,normalOffsetHypothesisMm:0,hypothesisSource:"unknown",note:"centerMm means ball-center z above carpet; lateral center is between the supporting pair. 900 mm and y = 0 are independent fixed scene assumptions, not tip height plus radius, drawing-derived centers, or a seated-contact solution. Use full-size algae from pieces.algae."},algaeHigh:{status:"assumed",source:"unknown; M pp.45-46 section 6.3.4.2 / Figure 6-3 verifies upper-pair staging, but no numeric ball-center height. D p.162 GE-25300 has no staged-ball center dimension.",verifiedFields:[],assumedFields:["centerHypothesisMm","normalOffsetHypothesisMm"],unknownFields:["centerMm","normalOffsetMm"],centerMm:null,centerHypothesisMm:1300,normalOffsetMm:null,normalOffsetHypothesisMm:0,hypothesisSource:"unknown",note:"1300 mm and y = 0 are independent fixed scene assumptions, not a measured center or branch-contact solution. Do not move the ball vertically to meet a robot hand. Staged algae does not contact coral on L4 per M p.45."},floorCoral:{status:"assumed",source:"unknown for actual carpet-supported axis; nominal piece OD from M p.33.",verifiedFields:[],assumedFields:["axisHypothesisMm"],unknownFields:["axisMm"],axisMm:null,axisHypothesisMm:57.15,hypothesisSource:"unknown",derivation:"Horizontal ideal circular cylinder on flat carpet: pieces.coral.outsideDiameterMm / 2. No sink, deformation or roller compression.",note:"Loose horizontal coral pickup, not the initial upright coral supporting algae shown in Figure 6-2. Plan yaw and robot receiver orientation must be explicit."},floorAlgae:{status:"assumed",source:"unknown for actual carpet-supported center; gauge dimensions from M p.34.",verifiedFields:[],assumedFields:["centerHypothesisMm"],unknownFields:["centerMm"],centerMm:null,centerHypothesisMm:206.375,hypothesisSource:"unknown",derivation:"Ideal sphere on flat carpet: pieces.algae.diameterMm / 2. Actual shape, sink and compression unresolved.",note:"Loose algae pickup is separate from initial algae-on-coral staging."},stagedFloorAlgae:{status:"assumed",source:"unknown for numerical center; M p.45 Figure 6-2 visually shows algae atop upright coral and section 6.3.4.2 specifies algae atop each marked coral.",verifiedFields:[],assumedFields:["centerHypothesisMm"],unknownFields:["centerMm"],centerMm:null,centerHypothesisMm:508,hypothesisSource:"unknown",derivation:"Coarse upper-tangent sketch only: pieces.coral.lengthMm + pieces.algae.diameterMm / 2. A sphere can seat into the pipe opening; the actual contact solution and center are NOT established by this sum.",note:"Show upright full-length coral and the supported ball as distinct pieces; do not represent this starting condition as an independent ball on carpet."}}};var Yd=[{id:"R01",title:"Split-Task Elevator",family:"Separate coral elevator and folding telescopic algae arm",strategy:"Baseline all-rounder: station or floor coral to L1-L4, independent algae clearing to processor, and deep-climb intent. Separate retention can preserve one coral while clearing algae for an alliance approach. Deliberately omit net.",tradeoff:"Two manipulators and a staged coral handoff compete for front access and stow space. Processor delivery can supply the opposing human player; clearing has no standalone points. Deep-climb integration remains a major risk.",firstTest:"Mock up the intact bumper, powered pickup/indexer/cradle and both occupied stow pockets at full scale. Try skewed loose coral, stacked-piece separation, low-momentum handoff and battery extraction before choosing lift or climb drives.",capabilities:{coralLevels:[1,2,3,4],coralSources:["station","floor"],algaeSources:["reefLow","reefHigh","floor"],algaeDestinations:["processor"],climb:"deep",simultaneousCarry:!0},subsystems:{drive:"Four renderer-supplied swerve envelopes on the common 700 x 760 chassis. Preserve the intact bumper ring; neither pickup uses a bumper gap. Translate to the chosen tool lane, lower carried loads before travel and limit motion when raised; stability is untested.",coral:"Left folding powered pickup raises station or floor coral over the bumper into an independent-side indexer, stopped cradle and elevator wrist. A folding telescopic wrist offers L1-L4. The 160 mm tool blocks are partial roller/gripper envelopes, not the 301.625 mm coral length; retained coral is longitudinal. Confirm receiver ownership before feeding.",algae:"A separate right shoulder carries a folding, telescoping two-link arm and opposed compliant gripping rollers. Its 300 mm tool blocks denote partial grip, not an undersized full-ball cage; check the complete 406.4-419.1 mm ball. Retain at the high right pocket, then lower and reverse into processor. No net hardware or net capability is proposed.",climb:"Rear-left winch and hinged telescoping arm show the same hook folded and offered behind the chassis. Deep is a cage-setting intent, not a verified engagement height. Winch, arm and cable connect geometrically; joint stops, reeving, cage/ANCHOR clearance, brake and structural load proof remain unresolved.",packaging:"Rear-center battery box has a separate 260 x 220 x 560 empty lift/service reserve above it; electrical panel and winch sit left of that corridor. Coral low-left and algae high-right retention are distinct. Use routed aluminum/polycarbonate plates, tubes, spacers and printed guides; no precision bends or copied team dimensions.",control:"Track one coral and one algae independently across all contacts. Permit simultaneous retention, but serialize crossing front sweeps. Confirm indexer alignment, receiver-ready and capture before release. Unknown occupancy or location inhibits pickup/ejection; guard release zones, protected space and climb interlocks. Jam recovery retains ownership.",stow:"Latch pickup upright, lower/fold the wrist into its cradle, retract/fold the algae arm into its own pocket and retract the rear hook. Repeated links/tools are alternative poses of these same mechanisms, not simultaneous hardware. All tool z values are proposals; reef algae centers and processor edge-specific height remain unknown. Endpoint bounds do not prove swept clearance."},cycle:{auto:"Start with latched hardware and one retained coral. Coordinate LEAVE and a selected reef offer with alliance partners; choose L4 only after insertion checks, otherwise a supported lower level. Stop further acquisition when occupied or uncertain. No autonomous cycle count or success rate is assumed.",coral:"Receive station coral or lower the pickup outside the front bumper for loose coral. Lift before crossing the bumper, independently align into the cradle, confirm wrist capture, then raise/extend for L1 or L2-L4 insertion and controlled release. On initially stacked pieces, separately secure/remove algae before coral; do not sweep in a second piece.",algae:"With the coral wrist retained clear, reach the selected reef or floor pose, pinch one algae, withdraw and fold to the right retention pocket. Clear algae from stacked coral without dragging the coral into control unintentionally. Lower/extend to the processor and reverse only after alignment; confirm empty before reacquisition.",endgame:"Finish controlled releases, empty both paths, lower/latch the wrist and pickup, and fold/lock the algae arm. Approach the assigned deep cage, deploy the rear hook, confirm permitted engagement and winch the arm in. Verify carpet and ANCHOR clearance separately; the drawn hook is not a qualified climb. Park if the attempt cannot be established."},inspiration:[{source:"research/2025-coral/2056-binder.md",lesson:"The inspected 2056 binder separates acquisition, independent-side straightening and stopped cradle acceptance. Adopt that functional division and explicit transfer sensing as an original proposal; do not copy their dimensions, reductions, folded bracket or claimed performance."},{source:"research/2025-coral/1690-1778.md",lesson:"1690's author-reported separation of over-bumper pickup and orientation, including the installed rear-roller dead spot, motivates a continuous powered handoff test. It does not establish this elevator, algae arm, simultaneous-carry packaging or deep climb."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"Processor value, reef access and alliance coral-level coverage motivate this baseline; removal alone earns nothing and processor supply can help the opponent. All field references and unknown-height guards come from the bounded analysis, not inferred team geometry."}],geometry:{boxes:[{name:"Coral mast foot",role:"structure",center:[-170,280,205],size:[220,120,110],state:"base"},{name:"Coral carriage stowed",role:"coral",center:[-170,280,730],size:[180,100,100],state:"stowed"},{name:"Pickup pivot and drive",role:"coral",center:[-170,70,270],size:[280,110,120],state:"base"},{name:"Pickup folded rollers",role:"coral",center:[-170,60,600],size:[300,110,200],state:"stowed"},{name:"Independent-side indexer",role:"coral",center:[-170,150,320],size:[280,180,100],state:"base"},{name:"Stopped coral cradle",role:"coral",center:[-170,210,405],size:[180,140,110],state:"base"},{name:"Algae shoulder and drive",role:"algae",center:[230,440,240],size:[130,160,170],state:"base"},{name:"Battery",role:"electrical",center:[0,600,240],size:[240,200,160],state:"base"},{name:"Battery service reserve",role:"electrical",center:[0,600,610],size:[260,220,560],state:"base"},{name:"Electrical panel",role:"electrical",center:[-230,450,210],size:[160,100,100],state:"base"},{name:"Deep winch base",role:"climb",center:[-265,650,250],size:[110,140,150],state:"base"},{name:"Deep hook retracted",role:"climb",center:[-265,520,930],size:[100,100,120],state:"stowed"},{name:"Deep hook offered",role:"climb",center:[-265,1030,440],size:[110,100,160],state:"deployed"}],links:[{name:"Coral nested mast stowed",role:"structure",points:[[-170,280,205],[-170,280,1e3]],radius:20,state:"base"},{name:"Pickup fold stowed",role:"coral",points:[[-170,70,170],[-170,70,290],[-170,60,600]],radius:16,state:"stowed"},{name:"Pickup station pose",role:"coral",points:[[-170,70,290],[-170,70,920],[-170,-160,1050]],radius:16,state:"deployed"},{name:"Pickup floor pose",role:"coral",points:[[-170,70,290],[-170,-110,280],[-170,-250,80]],radius:16,state:"deployed"},{name:"Wrist retained pose",role:"coral",points:[[-170,280,730],[-170,180,450]],radius:16,state:"stowed"},{name:"Lift and wrist L1 pose",role:"coral",points:[[-170,280,205],[-170,280,560],[-170,-210,560]],radius:16,state:"deployed"},{name:"Lift and wrist L4 pose",role:"coral",points:[[-170,280,205],[-170,280,2020],[-170,-210,2020]],radius:16,state:"deployed"},{name:"Algae arm folded",role:"algae",points:[[230,440,300],[250,440,960],[120,250,750]],radius:20,state:"stowed"},{name:"Algae arm floor pose",role:"algae",points:[[230,440,300],[230,-110,450],[140,-255,235]],radius:20,state:"deployed"},{name:"Algae arm reef low pose",role:"algae",points:[[230,440,300],[230,30,1e3],[140,-210,1030]],radius:20,state:"deployed"},{name:"Algae arm reef high pose",role:"algae",points:[[230,440,300],[230,30,1300],[140,-210,1530]],radius:20,state:"deployed"},{name:"Algae arm processor pose",role:"algae",points:[[230,440,300],[230,0,640],[140,-210,455]],radius:20,state:"deployed"},{name:"Deep arm retracted",role:"climb",points:[[-265,650,200],[-265,650,330],[-265,650,760],[-265,520,930]],radius:20,state:"stowed"},{name:"Deep arm deployed",role:"climb",points:[[-265,650,330],[-265,850,670],[-265,1030,440]],radius:20,state:"deployed"},{name:"Deep winch cable proposal",role:"climb",points:[[-265,650,250],[-265,850,670],[-265,1030,440]],radius:6,state:"deployed"}],tools:[{name:"Coral station pickup",role:"coral",center:[-170,-160,1050],size:[160,160,140],state:"deployed"},{name:"Coral floor pickup",role:"coral",center:[-170,-250,80],size:[160,140,140],state:"deployed"},{name:"Coral retained wrist",role:"coral",center:[-170,180,450],size:[160,160,140],state:"stowed"},{name:"Coral L1 offer",role:"coral",center:[-170,-210,560],size:[160,160,140],state:"deployed"},{name:"Coral L4 offer",role:"coral",center:[-170,-210,2020],size:[160,160,140],state:"deployed"},{name:"Algae floor partial grip",role:"algae",center:[140,-255,235],size:[300,300,300],state:"deployed"},{name:"Algae reef low partial grip",role:"algae",center:[140,-210,1030],size:[300,300,300],state:"deployed"},{name:"Algae reef high partial grip",role:"algae",center:[140,-210,1530],size:[300,300,300],state:"deployed"},{name:"Algae retained partial grip",role:"algae",center:[120,250,750],size:[300,300,300],state:"stowed"},{name:"Algae processor offer",role:"algae",center:[140,-210,455],size:[300,300,300],state:"deployed"}],routes:[{name:"Coral station to wrist",role:"coral",points:[[-170,-160,1050],[-170,-160,400],[-170,150,320],[-170,210,405],[-170,180,450]]},{name:"Coral floor over bumper",role:"coral",points:[[-170,-250,80],[-170,-250,300],[-170,150,320],[-170,210,405],[-170,180,450]]},{name:"Coral L1-L4 offer options",role:"coral",points:[[-170,180,450],[-170,-210,560],[-170,-210,920],[-170,-210,1320],[-170,-210,2020]]},{name:"Algae floor to retained",role:"algae",points:[[140,-255,235],[140,-255,520],[120,250,750]]},{name:"Algae reef low to retained",role:"algae",points:[[140,-210,1030],[140,-210,1750],[120,250,1750],[120,250,750]]},{name:"Algae reef high to retained",role:"algae",points:[[140,-210,1530],[140,-210,1750],[120,250,1750],[120,250,750]]},{name:"Algae retained to processor",role:"algae",points:[[120,250,750],[140,-210,750],[140,-210,455]]}],annotations:[{at:[-170,-210,2180],text:"Tool poses, not field heights"},{at:[120,250,1020],text:"Separate one-of-each retention"},{at:[0,600,900],text:"Empty battery lift reserve"},{at:[-265,1030,590],text:"Hook intent, not load proof"}]}},{id:"R02",title:"One Carriage, Two Tools",family:"Shared telescopic elevator with swiveling opposed tools",strategy:"One lift and swiveling yoke handle station/floor coral L1-L4 and reef/floor algae. Processor is the low outlet; high net placement is unverified intent. Shallow climb trades deep-climb points for simpler rear packaging.",tradeoff:"Coral and algae tasks are serial: a held piece owns the lift and blocks the other tool. Net placement adds height, stability and contact risks without a verified rim target. One carriage avoids a handoff but becomes a shared failure point.",firstTest:"Make a full-size opposed-tool yoke and fold/reach fixture. Prove separate retention and release of coral and maximum-size algae, empty-owner switching, floor reach over intact bumpers and battery access before pursuing the high net pose.",capabilities:{coralLevels:[1,2,3,4],coralSources:["station","floor"],algaeSources:["reefLow","reefHigh","floor"],algaeDestinations:["processor","net"],climb:"shallow",simultaneousCarry:!1},subsystems:{drive:"Common four-module swerve chassis and continuous removable bumpers. The center-front work lane serves both pieces; align the whole chassis before raising. High placement needs a separate tip-margin, acceleration and contact study, not a speed or stability claim.",coral:"One nested elevator, folding telescopic reach wrist and swiveling yoke carry a compact coral roller grip opposite an algae head. Acquire directly from station or outside-bumper floor pose, retain in that same grip and rotate for trough or branch insertion. The 160 mm blocks show only partial contact hardware, not the full 301.625 mm coral.",algae:"The opposite compliant jaw/roller head occupies the same lift and wrist. Nominal 300 mm pose blocks and a 280 x 300 x 300 stowed head are partial grips around 406.4-419.1 mm algae, not full-ball enclosures. Reef/floor capture feeds no separate buffer: retain in the head, then reverse for processor or raise for tentative over-net placement.",climb:"Rear-right winch pulls a folding arm with one hook, shown retracted and offered for a shallow cage. This omits deep capability; shallow does not imply proven simplicity or reliability. Confirm legal cage engagement, reeving, brakes, stops, ANCHOR avoidance and a structural load path before any loaded attempt.",packaging:"Opposed heads fold across the front; the rear-center battery has a 280 x 200 x 560 empty vertical service reserve. A left electrical panel and right climb base flank that corridor. Make located flat plates, tube stages and printed contact guides; Kraken/WCP are sourcing preferences only, with drives and interfaces unselected.",control:"A single owner state is empty, coral, algae or unknown. Switch the yoke only when empty and confirmed clear; never acquire the other piece while occupied. Confirm jaw capture, head orientation and height before motion. Unknown state inhibits pickup and release. Enforce location, extension, net-contact and climb/stow guards; controlled recovery cannot launch a jam blindly.",stow:"Lower the nested mast, fold the reach wrist inward and park both opposed heads in their shown boxes; retract the rear hook. All deployed links are mutually exclusive snapshots of this one carriage, with the idle head folded against its yoke. Full two-head sweeps remain untested. Tool heights are proposals; reef centers, processor datum and net rim remain unknown. Net capability is placement intent, not a height pass."},cycle:{auto:"Preload the coral head only, latch the algae head clear and coordinate LEAVE with a selected coral offer. Do not assume AUTO algae entry by a human player or count a second piece on the opposed head. Add task switching only after independent empty-state confirmation and trajectory tests.",coral:"Select the empty coral head, receive from station or reach below the bumper outside its front face. Raise a floor piece before retracting, retain in the same head, set the wrist for L1 or L2-L4 and release only at the intended reef location. Withdraw, verify empty, then choose the next owner. Stacked algae must be handled in a separate task first.",algae:"After coral release, switch the empty yoke, grip one reef or floor algae and retract while retaining it. Choose a low processor offer or tentative high net placement with no NET contact. Rim geometry must be resolved before any net reach claim. Confirm release before switching back to coral; the shared lift cannot stage another piece.",endgame:"Complete or safely recover the current piece, verify both heads empty, retract the wrist and telescope, latch the yoke and inhibit scoring drives. Present the rear hook to the assigned shallow cage, verify allowed engagement and winch inward. Cage qualification and load support are unproved; retain a parking fallback if engagement is uncertain."},inspiration:[{source:"research/2025-coral/1690-1778.md",lesson:"1778's author-reported receiver misalignment and stationary-contact issues motivate keeping each piece on its acquiring head and testing release reactions. The opposed-head shared carriage is our proposal, not a 1778 replica or a reported dual-piece mechanism."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"The shared-tool family trades duplicate mechanisms for serialized ownership. Alliance coral-level coverage and a shallow cage are strategic choices, not success predictions. Lowest net mesh is not rim height, so the high placement option deliberately has no verified height pass."}],geometry:{boxes:[{name:"Shared mast foot",role:"structure",center:[0,440,200],size:[300,140,100],state:"base"},{name:"Shared carriage stowed",role:"structure",center:[0,440,930],size:[180,120,140],state:"stowed"},{name:"Coral head stowed",role:"coral",center:[-180,230,650],size:[160,160,140],state:"stowed"},{name:"Algae head stowed",role:"algae",center:[120,230,650],size:[280,300,300],state:"stowed"},{name:"Swivel yoke hub",role:"structure",center:[0,230,650],size:[100,100,90],state:"stowed"},{name:"Battery",role:"electrical",center:[0,620,240],size:[260,180,160],state:"base"},{name:"Battery service reserve",role:"electrical",center:[0,620,610],size:[280,200,560],state:"base"},{name:"Electrical panel",role:"electrical",center:[-250,440,240],size:[120,150,130],state:"base"},{name:"Shallow winch base",role:"climb",center:[260,610,250],size:[120,170,160],state:"base"},{name:"Shallow hook retracted",role:"climb",center:[260,680,910],size:[100,100,130],state:"stowed"},{name:"Shallow hook offered",role:"climb",center:[260,1040,1040],size:[120,140,170],state:"deployed"}],links:[{name:"Shared mast nested",role:"structure",points:[[0,440,200],[0,440,1010]],radius:25,state:"base"},{name:"Shared wrist and yoke stowed",role:"structure",points:[[0,440,930],[0,230,650],[-180,230,650],[0,230,650],[120,230,650]],radius:15,state:"stowed"},{name:"Shared lift coral station",role:"coral",points:[[0,440,200],[0,440,990],[0,-20,1060],[0,-180,1060]],radius:18,state:"deployed"},{name:"Shared lift coral floor",role:"coral",points:[[0,440,200],[0,440,520],[0,-105,400],[0,-260,85]],radius:18,state:"deployed"},{name:"Shared lift coral L1",role:"coral",points:[[0,440,200],[0,440,700],[0,-20,560],[0,-220,560]],radius:18,state:"deployed"},{name:"Shared lift coral L4",role:"coral",points:[[0,440,200],[0,440,1980],[0,-20,2050],[0,-220,2050]],radius:18,state:"deployed"},{name:"Shared lift algae floor",role:"algae",points:[[0,440,200],[0,440,650],[0,-110,520],[0,-255,235]],radius:18,state:"deployed"},{name:"Shared lift algae reef low",role:"algae",points:[[0,440,200],[0,440,1020],[0,-20,1020],[0,-200,1020]],radius:18,state:"deployed"},{name:"Shared lift algae reef high",role:"algae",points:[[0,440,200],[0,440,1520],[0,-20,1520],[0,-200,1520]],radius:18,state:"deployed"},{name:"Shared lift algae processor",role:"algae",points:[[0,440,200],[0,440,650],[0,-20,465],[0,-200,465]],radius:18,state:"deployed"},{name:"Shared lift algae net intent",role:"algae",points:[[0,440,200],[0,440,2250],[0,20,2450],[0,-190,2480]],radius:18,state:"deployed"},{name:"Shallow arm retracted",role:"climb",points:[[260,610,200],[260,640,330],[260,680,910]],radius:20,state:"stowed"},{name:"Shallow arm deployed",role:"climb",points:[[260,640,330],[260,850,1e3],[260,1040,1040]],radius:20,state:"deployed"},{name:"Shallow winch cable proposal",role:"climb",points:[[260,610,250],[260,850,1e3],[260,1040,1040]],radius:6,state:"deployed"}],tools:[{name:"Coral station grip",role:"coral",center:[0,-180,1060],size:[160,160,140],state:"deployed"},{name:"Coral floor grip",role:"coral",center:[0,-260,85],size:[160,140,140],state:"deployed"},{name:"Coral L1 offer",role:"coral",center:[0,-220,560],size:[160,160,140],state:"deployed"},{name:"Coral L4 offer",role:"coral",center:[0,-220,2050],size:[160,160,140],state:"deployed"},{name:"Algae floor partial grip",role:"algae",center:[0,-255,235],size:[300,300,300],state:"deployed"},{name:"Algae reef low partial grip",role:"algae",center:[0,-200,1020],size:[300,300,300],state:"deployed"},{name:"Algae reef high partial grip",role:"algae",center:[0,-200,1520],size:[300,300,300],state:"deployed"},{name:"Algae processor offer",role:"algae",center:[0,-200,465],size:[300,300,300],state:"deployed"},{name:"Algae net placement intent",role:"algae",center:[0,-190,2480],size:[300,300,300],state:"deployed"}],routes:[{name:"Coral station to retained",role:"coral",points:[[0,-180,1060],[0,40,1100],[-180,230,650]]},{name:"Coral floor over bumper",role:"coral",points:[[0,-260,85],[0,-260,310],[-180,230,650]]},{name:"Coral L1-L4 offer options",role:"coral",points:[[-180,230,650],[0,-220,560],[0,-220,930],[0,-220,1330],[0,-220,2050]]},{name:"Algae floor to retained",role:"algae",points:[[0,-255,235],[0,-255,520],[120,230,650]]},{name:"Algae reef low to retained",role:"algae",points:[[0,-200,1020],[0,-200,1760],[120,230,1760],[120,230,650]]},{name:"Algae reef high to retained",role:"algae",points:[[0,-200,1520],[0,-200,1760],[120,230,1760],[120,230,650]]},{name:"Algae processor option",role:"algae",points:[[120,230,650],[0,-200,650],[0,-200,465]]},{name:"Algae net placement option",role:"algae",points:[[120,230,650],[0,100,1900],[0,-190,2480]]}],annotations:[{at:[0,230,830],text:"One lift; exclusive piece owner"},{at:[0,-190,2720],text:"Net rim unknown; intent only"},{at:[0,620,900],text:"Empty battery lift reserve"},{at:[260,1040,1190],text:"Hook intent, not load proof"}]}},{id:"R03",title:"Station Sprint + Algae Launcher",family:"Slim station coral elevator with independent retained algae launcher",strategy:"Specialize in station-fed coral L1-L4 while a separate front algae arm feeds a retained net launcher or low processor bypass. Deep-climb intent and distinct one-of-each storage support an alliance role; deliberately give up floor coral.",tradeoff:"Station dependence sacrifices loose-coral recovery. Algae acquisition, retention, diverter and launcher add transfer and tuning risks. The launcher route is not ballistics or an accuracy claim; deep climb also competes for packaging.",firstTest:"Test the algae pickup-to-pocket transfer, positive gate, low bypass and flywheel/hood fixture across the full ball-size range. Check retention, misfeed recovery and intact-bumper clearance before guarded launch trials or shot tuning.",capabilities:{coralLevels:[1,2,3,4],coralSources:["station"],algaeSources:["reefLow","reefHigh","floor"],algaeDestinations:["processor","net"],climb:"deep",simultaneousCarry:!0},subsystems:{drive:"Use the common swerve chassis with an intact bumper ring. Rear-left station docking and front reef offers use the coral lane; front-center algae acquisition has its own lane. Raised travel, launch reactions and two-piece center of gravity require measurement. No sprint time, mass or reliability is assigned.",coral:"A slim left nested elevator carries a folding telescopic wrist with a retained roller grip. Receive only from the rear station pose, fold to the left pocket, then extend forward for L1-L4. No floor-coral acquisition path or extra indexer is hidden here. The 160 mm tool envelopes are partial grips; retained coral lies longitudinally and keeps its full 301.625 mm length.",algae:"Front folding telescope and compliant scoop grip floor/reef algae, then hand one ball to the gated feed-belt pocket. Two side flywheel banks, short vertical axes and a segmented hood define a retained launcher. A closed launch gate selects a low return bypass to the same scoop for processor discharge. The 300 mm heads are partial grips; the 430 mm retained envelope reserves a complete maximum-size ball.",climb:"Rear-right winch base anchors a hinged telescoping arm with retracted and deployed hook envelopes. Finish releases and fold the acquisition arm before presenting the assigned deep-cage hook. Cable reeving, holding brake, legal contact, cage/ANCHOR separation and load proof are open; neither hook pose nor arm lines establish a successful climb.",packaging:"Rear-center battery and its separate 260 x 200 x 560 empty lift reserve remain between the left coral mast and right climb base. The algae pocket occupies the front-center upper bay; coral retention stays left of the full-ball envelope. Build flat router-cut plates, spacers/tubes and segmented polycarbonate guides, not precision bent parts or unverified vendor assemblies.",control:"Count one algae across scoop, belt, pocket and diverter, and one coral in its separate grip. Gate transfer on receiving-pocket readiness and confirmed capture; inhibit acquisition when either algae location is occupied/unknown. Processor bypass requires launcher stopped and isolated. Net release requires verified location, aim and safe containment; no blind jam launch. Climb disables both paths.",stow:"Nest the coral lift and wrist, fold the algae scoop under its retained pocket, latch launch gate/hood and retract the rear hook. Repeated tools/links are alternative poses, not multiple acquisitions or simultaneous launcher outlets. All target z values are design proposals. Reef algae centers, processor edge datum and net rim remain unknown; no net height pass, swept-clearance or ballistics result is claimed."},cycle:{auto:"Start with a retained coral and empty algae path. Coordinate LEAVE and a station-lane coral offer with the alliance. Add robot-acquired algae only after the independent gate/occupancy sequence is validated; do not assume human-player algae entry during AUTO or a measured shooting success rate.",coral:"Dock the empty grip at the rear station, receive one coral, confirm retention and fold inward. Drive to the selected reef approach, raise/extend and orient for L1 or L2-L4 insertion, then release and confirm empty. Return to the station. Loose floor coral is intentionally left for a partner; algae handling can retain its own one ball separately.",algae:"Grip one loose floor or selected reef algae; treat algae atop coral as a separate extraction case. Lift clear of the bumper, dock at the pocket and confirm gate retention before releasing the scoop. Feed the guarded flywheel/hood outlet for net intent, or stop/isolate it and return through the low bypass to the scoop for processor release.",endgame:"Finish a controlled discharge, confirm the algae pocket and coral grip empty, stop flywheels, close gates and fold/latch both manipulators. Approach the assigned deep cage, offer the rear hook and verify permitted engagement before winching. Check carpet and ANCHOR clearance independently; retain parking as fallback, not as assumed points after failure."},inspiration:[{source:"research/2025-coral/2056-binder.md",lesson:"2056's inspected stopped-cradle and two-stage detection account motivates positive offer/accept ownership and retained buffering. Applying that principle to an algae pocket, gate and launcher is an original proposal, not a reported 2056 launcher or a clone of its dimensions."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"Station specialization deliberately sacrifices floor coral. Net and processor choices depend on travel, delivery and opposing human-player consequences, none measured here. The analysis leaves net rim and reef algae centers null; it provides no launcher trajectory, accuracy or climb reliability."}],geometry:{boxes:[{name:"Slim nested coral mast",role:"structure",center:[-245,440,590],size:[90,120,880],state:"base"},{name:"Coral carriage stowed",role:"coral",center:[-245,440,850],size:[150,100,130],state:"stowed"},{name:"Algae shoulder and drive",role:"algae",center:[270,70,235],size:[100,110,150],state:"base"},{name:"Algae scoop folded",role:"algae",center:[100,175,370],size:[300,300,300],state:"stowed"},{name:"Retaining feed belt",role:"algae",center:[100,330,575],size:[430,220,90],state:"base"},{name:"Launch gate and low diverter",role:"algae",center:[100,240,640],size:[380,80,50],state:"base"},{name:"Flywheel left bank",role:"algae",center:[-120,170,815],size:[40,220,280],state:"base"},{name:"Flywheel right bank",role:"algae",center:[320,170,815],size:[40,220,280],state:"base"},{name:"Segmented launcher hood",role:"algae",center:[100,190,995],size:[420,310,80],state:"base"},{name:"Battery",role:"electrical",center:[0,640,240],size:[240,180,160],state:"base"},{name:"Battery service reserve",role:"electrical",center:[0,640,610],size:[260,200,560],state:"base"},{name:"Electrical panel",role:"electrical",center:[-245,630,235],size:[160,170,130],state:"base"},{name:"Deep winch base",role:"climb",center:[270,640,245],size:[120,170,150],state:"base"},{name:"Deep hook retracted",role:"climb",center:[270,680,900],size:[100,100,130],state:"stowed"},{name:"Deep hook offered",role:"climb",center:[270,1040,440],size:[120,140,160],state:"deployed"}],links:[{name:"Fixed launcher support frame",role:"structure",points:[[270,70,200],[320,300,570],[100,300,735],[320,300,570],[320,300,995],[100,190,995]],radius:18,state:"base"},{name:"Coral wrist retained",role:"coral",points:[[-245,440,850],[-230,290,550]],radius:16,state:"stowed"},{name:"Coral rear station pose",role:"coral",points:[[-245,440,200],[-245,440,1040],[-230,960,1060]],radius:16,state:"deployed"},{name:"Coral lift and wrist L1",role:"coral",points:[[-245,440,200],[-245,440,620],[-230,-210,560]],radius:16,state:"deployed"},{name:"Coral lift and wrist L4",role:"coral",points:[[-245,440,200],[-245,440,2020],[-230,-210,2030]],radius:16,state:"deployed"},{name:"Algae scoop folded arm",role:"algae",points:[[270,70,300],[270,120,500],[100,175,370]],radius:18,state:"stowed"},{name:"Algae arm floor pose",role:"algae",points:[[270,70,300],[270,-110,430],[100,-255,235]],radius:18,state:"deployed"},{name:"Algae arm reef low pose",role:"algae",points:[[270,70,300],[270,20,1e3],[100,-200,1040]],radius:18,state:"deployed"},{name:"Algae arm reef high pose",role:"algae",points:[[270,70,300],[270,20,1450],[100,-200,1540]],radius:18,state:"deployed"},{name:"Algae scoop low bypass pose",role:"algae",points:[[270,70,300],[100,240,640],[100,180,430],[100,-210,430]],radius:18,state:"deployed"},{name:"Launcher hood and outlet",role:"algae",points:[[320,300,570],[320,300,995],[270,80,995],[270,-100,970],[100,-205,825]],radius:16,state:"deployed"},{name:"Flywheel left short axis",role:"algae",points:[[-120,170,750],[-120,170,880]],radius:10,state:"base"},{name:"Flywheel right short axis",role:"algae",points:[[320,170,750],[320,170,880]],radius:10,state:"base"},{name:"Deep arm retracted",role:"climb",points:[[270,640,200],[270,650,340],[270,680,900]],radius:20,state:"stowed"},{name:"Deep arm deployed",role:"climb",points:[[270,650,340],[270,880,690],[270,1040,440]],radius:20,state:"deployed"}],tools:[{name:"Coral station grip",role:"coral",center:[-230,960,1060],size:[160,160,140],state:"deployed"},{name:"Coral retained wrist",role:"coral",center:[-230,290,550],size:[160,160,140],state:"stowed"},{name:"Coral L1 offer",role:"coral",center:[-230,-210,560],size:[160,160,140],state:"deployed"},{name:"Coral L4 offer",role:"coral",center:[-230,-210,2030],size:[160,160,140],state:"deployed"},{name:"Algae floor partial grip",role:"algae",center:[100,-255,235],size:[300,300,300],state:"deployed"},{name:"Algae reef low partial grip",role:"algae",center:[100,-200,1040],size:[300,300,300],state:"deployed"},{name:"Algae reef high partial grip",role:"algae",center:[100,-200,1540],size:[300,300,300],state:"deployed"},{name:"Algae retained full envelope",role:"algae",center:[100,300,735],size:[430,430,430],state:"stowed"},{name:"Algae processor low exit",role:"algae",center:[100,-210,430],size:[300,300,300],state:"deployed"},{name:"Algae net launch outlet",role:"algae",center:[100,-205,825],size:[300,300,300],state:"deployed"}],routes:[{name:"Coral station to retained",role:"coral",points:[[-230,960,1060],[-230,600,1100],[-230,290,550]]},{name:"Coral L1-L4 offer options",role:"coral",points:[[-230,290,550],[-230,-210,560],[-230,-210,920],[-230,-210,1320],[-230,-210,2030]]},{name:"Algae floor to pocket",role:"algae",points:[[100,-255,235],[100,-255,540],[100,300,735]]},{name:"Algae reef low to pocket",role:"algae",points:[[100,-200,1040],[100,-200,1820],[100,300,1820],[100,300,735]]},{name:"Algae reef high to pocket",role:"algae",points:[[100,-200,1540],[100,-200,1820],[100,300,1820],[100,300,735]]},{name:"Algae isolated low bypass",role:"algae",points:[[100,300,735],[100,240,640],[100,175,370],[100,-210,430]]},{name:"Algae gated launcher feed",role:"algae",points:[[100,300,735],[100,170,780],[100,-205,825]]},{name:"Net intent; not ballistics",role:"algae",points:[[100,-205,825],[100,-800,1550],[100,-1550,2480],[100,-2200,2600]]}],annotations:[{at:[-230,960,1220],text:"Station only; no floor coral"},{at:[100,-900,1770],text:"Not ballistics; accuracy unknown"},{at:[100,-210,2170],text:"Reef centers / net rim unknown"},{at:[0,640,920],text:"Empty battery lift reserve"}]}}];var $d=[{id:"R04",title:"Telescopic Utility Arm",family:"Arm-carried shared two-shape intake, telescopic reach and independent deep-climb yoke",strategy:"Use one arm-carried gripper for station or floor coral through L1-L4, then switch empty to floor/reef algae and processor delivery. Serialize pieces and reserve a rear deep-climb approach; deliberately omit net scoring.",tradeoff:"No separate coral handoff, but shared contacts serialize tasks. Telescope stiffness, floor approach over intact bumpers, wrist retention and deep-climb integration remain unproven; no simultaneous carry or net.",firstTest:"Fixture the same wrist for loose coral and maximum-size algae; test retention, empty-mode switching and bumper clearance. Then sweep the proposed shoulder/telescope/wrist poses and separately load-test the deep yoke.",capabilities:{coralLevels:[1,2,3,4],coralSources:["station","floor"],algaeSources:["reefLow","reefHigh","floor"],algaeDestinations:["processor"],climb:"deep",simultaneousCarry:!1},subsystems:{drive:"Provisional 700 x 760 mm swerve chassis; x centered, y=0 front, z=0 floor. Renderer supplies modules and intact bumpers. Approach with the arm retracted, stop before extension, and protect partner/opponent space; no drivetrain sizing or speed claim.",coral:"One shoulder/telescope/wrist carries its own powered intake and opposing compliant contacts: capture, center, retain, orient and release in the SAME tool. Floor and station acquisition feed no separate receiver. L1 trough offering differs from L2/L3 insertion and L4 vertical placement; all tool poses are original hypotheses, not measured 2910 geometry.",algae:"The same wrist changes contact spacing while empty, captures one floor or low/high reef algae, retains it and offers to processor. No net. Algae tool envelopes include a 419.1 mm maximum ball plus jaw allowance, not an assumed piece exclusion. Reef and processor heights shown are provisional, not known field targets.",climb:"Rear winch/brake and yoke root (0,660,280) connect to folded, deep-hook approach and take-up alternatives. The two low rear hook boxes depict capture/tension intent, NOT cage-bottom-derived engagement heights. Select deep before the match; unload and fold the arm first. Cage/ANCHOR clearance, lifting load path and carpet-free qualification are unverified; drawings keep chassis on the floor, not falsely suspended.",packaging:"Reserve rear battery lift-out and right-side electrical access below the arm; keep bumpers removable and intact. Use original router-cut aluminum/polycarbonate plates, spacers, tubes and printed guides, not precision bends. Gear ratios, motors, mass, stiffness and service removal sweeps are unselected.",control:"One exclusive wrist owner: empty/coral/algae; unknown possession or pose inhibits intake and release. Confirm contact, centering, mode and retention separately. Guard swept extension, reef-zone coral release, field boundaries, cage/NET/protected-zone contact and climb stow. Stop on jams; recover only toward a verified safe location, never blind ejection.",stow:"Base/stowed hardware fits x +/-350, y 0..760 and z <=1066.8. Shoulder (0,420,610), folded telescope end (0,140,760), inward wrist (0,260,820). The stowed wrist allowance can contain one algae, but climb requires empty. All deployed links/tools are alternate poses of one arm, not simultaneous mechanisms; endpoint bounds do not prove retraction or swept clearance. Piece routes are center-path proposals, not successful motion."},cycle:{auto:"Begin stowed with at most one retained coral. Coordinate LEAVE and a selected L1-L4 placement with partners; verify release before a station reload or loose-floor retry. Algae processor work is only an alternative after empty-tool confirmation and authorized-space checks; do not promise a multi-piece routine or HP algae entry.",coral:"Empty coral-mode wrist -> station receive or isolate loose floor coral -> capture/center/retain -> raise beyond intact bumper -> orient for chosen L1-L4 -> verify placement and release -> withdraw. For initially stacked pieces, service algae separately first; no pushing an extra controlled coral and no separate coral handoff.",algae:"Confirm empty wrist, change contact spacing, acquire loose floor or provisional low/high reef algae, retain and retract inward, then offer through processor and confirm empty. Initially stacked algae-on-coral needs a separate isolation test; clearing is not scoring and must not claim every reef level is obstructed.",endgame:"Complete a guarded release, retract the empty wrist inward and latch shoulder/winch interlocks. Approach the preselected own deep cage with the rear yoke, capture then take up and lift only after engagement confirmation. No ANCHOR contact; verify carpet clearance and allowed contacts. Abort to park only if that separate condition is actually met."},inspiration:[{source:"research/2025-coral/2910-handoff.md",lesson:"Existing report attributes intake-carrying pivot/telescope/wrist architecture and active coral positioning to 2910 authors, including a later retrospective. It does not establish a separate elevator handoff, exact geometry or our algae/deep-climb capability. This shared contact arrangement, anchors and every dimension are original proposals, not a Spectre replica."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"Use the shared-tool ownership and complete-cycle guards from the bounded analysis. Low/high algae centers, processor edge-specific height and cage engagement remain unknown. No scores, mass, reliability or timing estimates are assigned; field reference heights do not certify a tool pose."}],geometry:{boxes:[{name:"Arm base left flat pivot plate",role:"structure",center:[-85,420,445],size:[22,220,470],state:"base"},{name:"Arm base right flat pivot plate",role:"structure",center:[85,420,445],size:[22,220,470],state:"base"},{name:"Arm base pivot cross-tie between chassis plates",role:"structure",center:[0,420,610],size:[210,80,70],state:"base"},{name:"Battery and rear lift-out reserve",role:"electrical",center:[0,625,165],size:[250,180,130],state:"base"},{name:"Right electrical panel reserve",role:"electrical",center:[250,525,270],size:[120,310,220],state:"base"},{name:"Left shoulder drive reserve",role:"structure",center:[-220,420,500],size:[140,150,140],state:"base"},{name:"Retracted telescope collar",role:"structure",center:[0,280,685],size:[95,90,95],state:"stowed"},{name:"Same inward wrist with conservative algae allowance",role:"algae",center:[0,260,820],size:[460,460,460],state:"stowed"},{name:"Deep winch brake reserve",role:"climb",center:[0,660,370],size:[140,100,100],state:"base"},{name:"Deep yoke chassis anchor",role:"climb",center:[0,660,280],size:[170,100,90],state:"base"},{name:"Deep hook folded inward",role:"climb",center:[0,635,740],size:[150,80,90],state:"stowed"},{name:"Deep hook approach alternative provisional",role:"climb",center:[0,990,145],size:[150,110,100],state:"deployed"},{name:"Deep hook take-up alternative not suspended",role:"climb",center:[0,990,285],size:[150,110,100],state:"deployed"}],links:[{name:"Arm shoulder to retracted telescope to inward wrist",role:"structure",points:[[0,420,610],[0,140,760],[0,260,820]],radius:28,state:"stowed"},{name:"Coral floor alternative shoulder telescope wrist",role:"coral",points:[[0,420,610],[0,-180,165],[0,-245,85]],radius:22,state:"deployed"},{name:"Coral station alternative shoulder telescope wrist",role:"coral",points:[[0,420,610],[0,-130,1060],[0,-190,1070]],radius:28,state:"deployed"},{name:"Coral L1 alternative shoulder telescope wrist",role:"coral",points:[[0,420,610],[0,-130,610],[0,-190,560]],radius:28,state:"deployed"},{name:"Coral L2 alternative shoulder telescope wrist",role:"coral",points:[[0,420,610],[0,-130,950],[0,-190,920]],radius:28,state:"deployed"},{name:"Coral L3 alternative shoulder telescope wrist",role:"coral",points:[[0,420,610],[0,-130,1370],[0,-190,1340]],radius:28,state:"deployed"},{name:"Coral L4 alternative shoulder telescope wrist",role:"coral",points:[[0,420,610],[0,-130,2050],[0,-190,2020]],radius:28,state:"deployed"},{name:"Algae floor alternative shoulder telescope wrist",role:"algae",points:[[0,420,610],[0,-120,300],[0,-175,235]],radius:28,state:"deployed"},{name:"Algae reef low alternative shoulder telescope wrist",role:"algae",points:[[0,420,610],[0,-120,1140],[0,-175,1120]],radius:28,state:"deployed"},{name:"Algae reef high alternative shoulder telescope wrist",role:"algae",points:[[0,420,610],[0,-120,1590],[0,-175,1570]],radius:28,state:"deployed"},{name:"Algae processor alternative shoulder telescope wrist",role:"algae",points:[[0,420,610],[0,-120,450],[0,-175,410]],radius:28,state:"deployed"},{name:"Deep yoke folded from chassis anchor",role:"climb",points:[[0,660,280],[0,660,700],[0,635,740]],radius:20,state:"stowed"},{name:"Deep yoke approach and turned hook alternative",role:"climb",points:[[0,660,280],[0,865,280],[0,1010,165],[0,990,130]],radius:20,state:"deployed"},{name:"Deep yoke take-up and turned hook alternative",role:"climb",points:[[0,660,280],[0,870,300],[0,1e3,310],[0,980,270]],radius:20,state:"deployed"}],tools:[{name:"Coral floor same wrist provisional",role:"coral",center:[0,-245,85],size:[380,200,170],state:"deployed"},{name:"Coral station same wrist provisional",role:"coral",center:[0,-190,1070],size:[360,220,220],state:"deployed"},{name:"Coral L1 same wrist provisional trough offer",role:"coral",center:[0,-190,560],size:[360,220,200],state:"deployed"},{name:"Coral L2 same wrist provisional insertion",role:"coral",center:[0,-190,920],size:[200,260,240],state:"deployed"},{name:"Coral L3 same wrist provisional insertion",role:"coral",center:[0,-190,1340],size:[200,260,240],state:"deployed"},{name:"Coral L4 same wrist provisional vertical offer",role:"coral",center:[0,-190,2020],size:[220,220,340],state:"deployed"},{name:"Algae floor same wrist plus max ball provisional",role:"algae",center:[0,-175,235],size:[460,460,470],state:"deployed"},{name:"Algae reef low same wrist plus max ball provisional",role:"algae",center:[0,-175,1120],size:[460,460,460],state:"deployed"},{name:"Algae reef high same wrist plus max ball provisional",role:"algae",center:[0,-175,1570],size:[460,460,460],state:"deployed"},{name:"Algae processor same wrist plus max ball provisional",role:"algae",center:[0,-175,410],size:[460,460,460],state:"deployed"}],routes:[{name:"Coral floor piece-center proposal via outside bumper rise to L4 not proven motion",role:"coral",points:[[0,-245,57.15],[0,-245,420],[0,260,820],[0,-190,2020]]},{name:"Coral station piece-center proposal to same wrist and L1 not proven motion",role:"coral",points:[[0,-190,1070],[0,260,820],[0,-190,560]]},{name:"Algae maximum-size loose floor center proposal to retention and processor not motion proof",role:"algae",points:[[0,-175,209.55],[0,-175,470],[0,260,820],[0,-175,410]]},{name:"Algae reef high center proposal via same retained wrist to processor not motion proof",role:"algae",points:[[0,-175,1570],[0,260,820],[0,-175,410]]},{name:"Algae reef low center proposal via same retained wrist to processor not motion proof",role:"algae",points:[[0,-175,1120],[0,260,820],[0,-175,410]]}],annotations:[{at:[0,420,610],text:"One arm; alternate poses"},{at:[0,260,820],text:"Inward shared wrist"},{at:[0,-175,1570],text:"Algae heights provisional"},{at:[0,990,145],text:"Deep hook target unverified"}]}},{id:"R05",title:"Lift-and-Center Carrier",family:"Self-capturing centering carrier directly feeding one compact coral elevator, separate short algae arm",strategy:"Capture floor coral in the moving carrier, center while raising and feed directly into the station-capable elevator tool for L1-L4. A separate short algae jaw serves floor/low reef to processor; reserve a shallow climb.",tradeoff:"The carrier owns capture, not a long V floor conveyor. Its locked lower contact adds a sensitive direct handoff. Independent one-coral/one-algae carry is a hypothesis; omit high-reef algae, net and deep climb to bound the short-arm design.",firstTest:"Test skewed floor coral with the carrier's lower contact locked; distinguish possession from centering and prove receiver retention before release. Check paired-piece envelopes, elevator stow and shallow-hook engagement next.",capabilities:{coralLevels:[1,2,3,4],coralSources:["station","floor"],algaeSources:["reefLow","floor"],algaeDestinations:["processor"],climb:"shallow",simultaneousCarry:!0},subsystems:{drive:"Same 700 x 760 mm chassis coordinates and renderer-supplied modules/intact bumpers. Carrier acquires ahead of the front bumper; a guarded chassis adjustment may help skewed coral but is not proven any-orientation pickup. Algae arm works to the right; do not traverse protected space with it extended.",coral:"The moving carrier has its OWN powered capture contact and an opposing lower contact locked relative to the carrier, not the world. Lift and converging flat guides center coral during raising; no long V conveyor or intermediate indexer. Direct handoff goes to the SAME compact nested-elevator wrist that receives station coral and offers L1-L4. Receiver retention must precede carrier release; one coral across both devices.",algae:"Independent jaw on a short telescopic pivot arm captures floor or provisional low-reef algae and feeds processor only. Deliberately omit high-reef reach and net. Deployed jaw envelopes include maximum 419.1 mm algae plus hardware clearance; retracted empty jaws fold inward. One of each may be retained only in checked separated poses; simultaneousCarry is design intent, not a tested ability.",climb:"Rear shallow winch/anchor (120,665,350) connects to an inward folded hook, an approach hook and a take-up alternative. Cage setting is chosen before the match. Those original hook poses are not the 765.175 mm cage-bottom reference. Unload both tools and stow carrier/elevator/arm first. Cage capture, ANCHOR avoidance, structure, load path and carpet clearance are unresolved; the ground-datum drawing is not a suspended scoring state.",packaging:"Left-rear electrical panel and rear battery lift-out are reserved separately from the right algae pivot and climb anchor. Build original carrier cheek plates, converging guides and locked-contact mounts from router-cut flat aluminum/polycarbonate, bolted spacers, tubes and printed guides; precision bends are unavailable. Keep intact bumper removal and service access; no selected mass, motor ratios or COTS fits.",control:"Track one coral across carrier/receiver plus one independent algae. Presence does not prove centering: require alignment and receiver grip before carrier release. Both extended mechanisms count toward the envelope; inhibit acquisition on unknown occupancy, lock shallow climb until both tools stow, and guard release location, protected zones and NET/ANCHOR contact. Jam recovery requires a verified safe destination, not blind ejection.",stow:"Retract mast and wrist inward; fold empty carrier and empty algae jaw inside x +/-350, y 0..760, z <=1066.8. Carrier pivot (-80,140,330), mast root (-80,350,260), algae pivot (220,390,740). Raised carrier, scoring links and climb hooks are alternate state proposals, not simultaneous copies. Deployed jaw may retain algae alongside one coral, but paired motion and bumper clearance are unproved. Piece routes propose centers, not successful trajectories."},cycle:{auto:"Start with one coral in the stowed elevator wrist; coordinate LEAVE and selected L1-L4 placement. If release is confirmed, choose station reload or a separately tested loose-floor carrier pickup. An independent floor/low-reef algae-to-processor routine is an alternative only after occupancy and space checks; no claimed cycle count or HP AUTO algae.",coral:"Carrier captures isolated floor coral, locks lower contact, raises/centers, aligns directly to receiver and releases only after grip confirmation. Alternatively receive station coral in that same elevator wrist. Retract carrier, elevate/orient, place L1-L4, confirm empty and withdraw. Initially stacked pieces need algae isolation before coral pickup.",algae:"Right jaw acquires one loose-floor or low-reef algae, retains away from the coral carrier, then approaches processor and confirms release. High reef and net are excluded. Holding one coral concurrently is optional pending paired-pose tests, not permission for a second coral or algae. Initially stacked pickup needs its own control/clearance test.",endgame:"Finish guarded piece delivery, empty both devices, fold carrier and algae jaw and lower the elevator. Reverse toward the preselected own shallow cage; deploy the connected rear hook, confirm capture, take up and lift. Verify allowed contacts and carpet clearance, never the cage-bottom line alone. A failed climb earns park only if park criteria are met."},inspiration:[{source:"research/2025-coral/1690-1778.md",lesson:"1778 authors report centering during intake raising, a stationary lower axle/contact important to handoff, and possession sensing that did not measure centering. Receiver alignment remained a failure concern. This independently capturing carrier, direct compact-elevator handoff, flat-plate geometry and algae/climb layout are original proposals; no reference dimensions, motor choices or reliability are copied."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"Independent one-coral/one-algae occupancy can support complementary cycles but is not proof of simultaneous mechanical clearance. Low-reef/processor tool heights and shallow-hook contacts remain provisional. Omit high-reef algae, net and deep climb explicitly rather than infer extra reach or capability from height guides."}],geometry:{boxes:[{name:"Compact coral mast nested outer envelope",role:"structure",center:[-80,350,600],size:[180,110,760],state:"base"},{name:"Coral mast chassis anchor",role:"structure",center:[-80,350,260],size:[230,180,100],state:"base"},{name:"Battery rear lift-out reserve",role:"electrical",center:[-40,610,170],size:[230,210,140],state:"base"},{name:"Left electrical service panel",role:"electrical",center:[-250,540,400],size:[130,270,190],state:"base"},{name:"Carrier own chassis pivot and flat cheek plates",role:"coral",center:[-80,140,330],size:[440,90,120],state:"base"},{name:"Same self-capturing carrier folded inward",role:"coral",center:[-80,105,490],size:[450,150,260],state:"stowed"},{name:"Carrier floor lower contact locked relative to carrier",role:"coral",center:[-80,-230,45],size:[380,120,50],state:"deployed"},{name:"Same carrier raised centered direct offer alternative",role:"coral",center:[-80,55,570],size:[450,190,180],state:"deployed"},{name:"Same elevator wrist inward direct receiver",role:"coral",center:[-80,185,620],size:[240,190,180],state:"stowed"},{name:"Independent short algae arm base",role:"algae",center:[220,390,740],size:[130,140,120],state:"base"},{name:"Same empty algae jaw folded inward",role:"algae",center:[170,430,885],size:[300,280,250],state:"stowed"},{name:"Shallow winch brake and chassis anchor",role:"climb",center:[120,665,350],size:[150,120,160],state:"base"},{name:"Shallow hook folded inward",role:"climb",center:[120,640,820],size:[160,100,100],state:"stowed"},{name:"Shallow hook approach alternative provisional",role:"climb",center:[120,985,920],size:[160,110,130],state:"deployed"},{name:"Shallow hook take-up alternative not suspended",role:"climb",center:[120,945,1020],size:[160,110,120],state:"deployed"}],links:[{name:"Carrier own floor capture link from chassis pivot",role:"coral",points:[[-80,140,330],[-80,-110,275],[-80,-230,85]],radius:18,state:"deployed"},{name:"Carrier raised centering link direct offer alternative",role:"coral",points:[[-80,140,330],[-80,55,570]],radius:18,state:"deployed"},{name:"Mast root to retracted carriage to same receiver wrist",role:"coral",points:[[-80,350,260],[-80,350,620],[-80,185,620]],radius:22,state:"stowed"},{name:"Coral station mast carriage reaching wrist alternative",role:"coral",points:[[-80,350,260],[-80,350,1070],[-80,-180,1070]],radius:22,state:"deployed"},{name:"Coral L1 mast carriage reaching wrist alternative",role:"coral",points:[[-80,350,260],[-80,350,560],[-80,-180,560]],radius:22,state:"deployed"},{name:"Coral L2 mast carriage reaching wrist alternative",role:"coral",points:[[-80,350,260],[-80,350,920],[-80,-180,920]],radius:22,state:"deployed"},{name:"Coral L3 mast carriage reaching wrist alternative",role:"coral",points:[[-80,350,260],[-80,350,1340],[-80,-180,1340]],radius:22,state:"deployed"},{name:"Coral L4 mast carriage reaching wrist alternative",role:"coral",points:[[-80,350,260],[-80,350,2020],[-80,-180,2020]],radius:22,state:"deployed"},{name:"Short algae arm folded telescope and inward jaw",role:"algae",points:[[220,390,740],[220,340,870],[170,430,885]],radius:20,state:"stowed"},{name:"Algae floor short telescope wrist alternative",role:"algae",points:[[220,390,740],[450,-120,300],[450,-160,235]],radius:20,state:"deployed"},{name:"Algae reef low short telescope wrist alternative",role:"algae",points:[[220,390,740],[450,-120,1140],[450,-160,1120]],radius:20,state:"deployed"},{name:"Algae processor short telescope wrist alternative",role:"algae",points:[[220,390,740],[450,-120,450],[450,-160,410]],radius:20,state:"deployed"},{name:"Shallow winch root to folded hook",role:"climb",points:[[120,665,350],[120,665,780],[120,640,820]],radius:20,state:"stowed"},{name:"Shallow connected approach and turned hook alternative",role:"climb",points:[[120,665,350],[120,960,940],[120,1010,940],[120,985,895]],radius:20,state:"deployed"},{name:"Shallow connected take-up and turned hook alternative",role:"climb",points:[[120,665,350],[120,925,1040],[120,970,1040],[120,945,995]],radius:20,state:"deployed"}],tools:[{name:"Coral floor carrier own powered capture provisional",role:"coral",center:[-80,-230,85],size:[460,230,170],state:"deployed"},{name:"Coral station same elevator wrist provisional",role:"coral",center:[-80,-180,1070],size:[300,220,220],state:"deployed"},{name:"Coral L1 same elevator wrist provisional trough offer",role:"coral",center:[-80,-180,560],size:[340,240,200],state:"deployed"},{name:"Coral L2 same elevator wrist provisional insertion",role:"coral",center:[-80,-180,920],size:[220,260,240],state:"deployed"},{name:"Coral L3 same elevator wrist provisional insertion",role:"coral",center:[-80,-180,1340],size:[220,260,240],state:"deployed"},{name:"Coral L4 same elevator wrist provisional vertical offer",role:"coral",center:[-80,-180,2020],size:[220,220,340],state:"deployed"},{name:"Algae floor independent jaw plus max ball provisional",role:"algae",center:[450,-160,235],size:[460,460,470],state:"deployed"},{name:"Algae reef low independent jaw plus max ball provisional",role:"algae",center:[450,-160,1120],size:[460,460,460],state:"deployed"},{name:"Algae processor independent jaw plus max ball provisional",role:"algae",center:[450,-160,410],size:[460,460,460],state:"deployed"}],routes:[{name:"Coral floor center proposal carrier raise center direct receiver to L4 not proven motion",role:"coral",points:[[-80,-230,57.15],[-80,-230,350],[-80,55,570],[-80,185,620],[-80,-180,2020]]},{name:"Coral station center proposal to same receiver then L1 not proven motion",role:"coral",points:[[-80,-180,1070],[-80,185,620],[-80,-180,560]]},{name:"Algae loose floor max-ball center proposal outside coral path to processor not motion proof",role:"algae",points:[[450,-160,209.55],[450,-160,600],[450,-160,410]]},{name:"Algae low-reef center proposal independent retained jaw to processor not proven motion",role:"algae",points:[[450,-160,1120],[450,-160,600],[450,-160,410]]}],annotations:[{at:[-80,-230,85],text:"Carrier captures and centers"},{at:[-80,55,570],text:"Locked contact; direct feed"},{at:[450,-160,1120],text:"Low reef only; provisional"},{at:[120,985,920],text:"Shallow engagement unverified"}]}},{id:"R06",title:"Turreted Reach",family:"Central limited-yaw turret with telescopic pitching boom and shared coral-algae wrist; park only",strategy:"Aim a shared telescopic wrist with limited turret yaw for station/floor coral L1-L4 and floor/both-reef algae to processor or provisional net placement. Rotation may reduce chassis turns; no faster-cycle claim. Deliberately park only.",tradeoff:"High risk: cable management, yaw backlash, boom deflection and range blind spots. No simultaneous carry or climber. Floor algae uses a near-limit corner envelope beyond preferred margin; net placement is unverified.",firstTest:"Sweep the full wrist, cables and maximum-size held algae through hard-stopped yaw, pitch and telescope states. Test corner floor clearance, backlash and blind spots; establish actual net opening geometry before testing placement.",capabilities:{coralLevels:[1,2,3,4],coralSources:["station","floor"],algaeSources:["reefLow","reefHigh","floor"],algaeDestinations:["processor","net"],climb:"park",simultaneousCarry:!1},subsystems:{drive:"Same 700 x 760 mm chassis, x centered/y front zero/z floor, with intact renderer-supplied bumpers and modules. A central turret proposes +/-55 degrees yaw from forward, with hard stops; this is an original limit, not continuous rotation. It can aim within that sector without turning the chassis, potentially reducing turns, not proving faster cycles. Outside the sector, retract and reposition the chassis.",coral:"Pitching telescope carries one permanently installed shared wrist with powered centering contacts and switchable jaw spacing. Floor capture and station reception retain coral in that SAME tool; no handoff or in-match tool replacement. Rotated L1-L4 alternatives have nonzero x. L1 offering, angled insertion and vertical L4 placement need separate orientation tests; station hardware pose is a box to keep tool clutter bounded.",algae:"Empty-mode jaw reconfiguration captures floor or provisional low/high reef algae and offers processor or net placement, not a claimed shot. Envelopes include a 419.1 mm ball plus hardware allowance; no algae exclusion. Corner-floor box (575,-225,235) contains offset ball center (595,-245,209.55) and reaches 455 mm extension, beyond preferred 420 but below 457.2. Net pose is an unverified height hypothesis, not a known rim or successful release.",climb:"PARK ONLY: deliberately no winch, hook or cage attachment to contain turret/boom complexity. Deliver or safely retain the existing piece in a verified low transit pose, retract, neutralize yaw and park with bumpers partly in own BARGE ZONE. Empty wrist permits full inward stow. No fake hook, claimed hanging state or cage points; protect cage approaches and obey opponent/protected-space restrictions.",packaging:"Front battery lift-out, rear-left electronics, yaw brake/drive and rear cable-loop reserves are explicit. Original flat router-cut aluminum/polycarbonate plates, spacers, tubes and printed guides replace precision bends. Cables require separate yaw/pitch/telescope routing, strain relief and hard-stop access; swept service clearances, mass, transmission sizing and vendor interfaces remain unknown.",control:"Exclusive empty/coral/algae wrist ownership; inhibit intake/release on unknown occupancy or pose. High-risk cable management, backlash, range blind spots and sensor occlusion need tests. Limit yaw, pitch and extension jointly using full hardware/held-algae bounds; retract before sector changes. Guard reef-zone coral release, processor alignment, no NET/ANCHOR contact and protected space. Jam recovery stops motion until safe release is known.",stow:"Chassis support reaches central yaw/shoulder (0,380,620); folded telescope end (0,160,810) connects to inward empty wrist (0,280,860). Base/stowed boxes and link radii stay inside x +/-350, y 0..760, z <=1066.8. Deployed examples are alternatives of one shared boom, not parallel arms or a motion simulation. Held algae needs a separate cleared low transit pose before empty full stow. Piece center routes and endpoint limits do not prove swept clearance."},cycle:{auto:"Start inward with one retained coral, coordinate LEAVE and one selected L1-L4 placement. Aim within the yaw sector, verify release and retract before station reload or isolated floor acquisition. An algae processor/net alternative needs prior geometry and occupancy validation; no assumed net routine, cycle count or HP algae entry in AUTO.",coral:"Confirm empty coral-mode wrist; receive from station or capture loose floor coral. Center and retain, retract to a checked transit pose, approach reef and yaw/pitch/extend to chosen L1-L4. Confirm insertion/support and release before withdrawing. Reposition chassis at yaw blind spots. Initially stacked algae-on-coral needs a separate isolation sequence.",algae:"Switch empty wrist, acquire isolated floor or provisional low/high reef algae and retain one ball. Include ball and jaws in every reach check. Deliver to processor, or use net-placement intent only after opening/contact clearance is established; then verify release and withdraw. Stacked-piece capture is untested; no simultaneous coral retention.",endgame:"No cage attempt. Finish a guarded delivery or retain the existing piece only in a separately checked low transit pose; retract the telescope, neutralize yaw and avoid partner cage paths. Prefer empty inward stow, then place bumpers partly in own BARGE ZONE. Park qualification must be checked; do not depict a hook or award a climb for this state."},inspiration:[{source:"research/2025-coral/2910-handoff.md",lesson:"The existing report attributes intake-carrying arm/telescope/wrist and active coral positioning to 2910 authors, not a separate feeder. The limited-yaw turret, switchable shared jaw, all anchors and net-placement proposal are original design hypotheses, not reported Spectre dimensions, a copied turret or evidence of algae success. No binder/CAD or extra source was consulted."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"The report permits conditional shared-tool concepts and intentional park-only tradeoffs; it does not establish net rim, reef algae centers, processor target or tool trajectories. Lowest hanging mesh is not a placement height. No physical NET contact, whole-robot occupancy and held-algae clearance remain guards; no invented mass, scores, rates or reliability support this high-risk candidate."}],geometry:{boxes:[{name:"Central turret chassis foundation",role:"structure",center:[0,380,290],size:[330,300,110],state:"base"},{name:"Central yaw and shoulder support",role:"structure",center:[0,380,465],size:[160,160,310],state:"base"},{name:"Limited-yaw bearing and hard-stop envelope",role:"structure",center:[0,380,570],size:[320,280,90],state:"base"},{name:"Left flat shoulder bearing plate",role:"structure",center:[-85,380,660],size:[24,150,200],state:"base"},{name:"Right flat shoulder bearing plate",role:"structure",center:[85,380,660],size:[24,150,200],state:"base"},{name:"Front battery lift-out reserve",role:"electrical",center:[0,150,175],size:[250,220,150],state:"base"},{name:"Rear-left electronics service reserve",role:"electrical",center:[-225,595,250],size:[170,250,210],state:"base"},{name:"Yaw drive and holding brake reserve",role:"structure",center:[230,550,440],size:[140,190,130],state:"base"},{name:"Rear cable-loop strain-relief reserve unswept",role:"electrical",center:[0,600,490],size:[190,180,170],state:"base"},{name:"Same telescope folded collar",role:"structure",center:[0,270,715],size:[110,100,130],state:"stowed"},{name:"Same empty shared wrist folded inward",role:"coral",center:[0,280,860],size:[380,250,270],state:"stowed"},{name:"Coral station same wrist receiving alternative provisional",role:"coral",center:[0,-150,1070],size:[360,230,220],state:"deployed"}],links:[{name:"Chassis foundation to central yaw shoulder anchor",role:"structure",points:[[0,380,290],[0,380,570],[0,380,620]],radius:32,state:"base"},{name:"Central shoulder retracted telescope inward wrist",role:"structure",points:[[0,380,620],[0,160,810],[0,280,860]],radius:28,state:"stowed"},{name:"Coral floor yawed boom telescope wrist alternative",role:"coral",points:[[0,380,620],[324,-169,160],[360,-230,85]],radius:22,state:"deployed"},{name:"Coral station boom telescope receiving wrist alternative",role:"coral",points:[[0,380,620],[0,-90,1050],[0,-150,1070]],radius:28,state:"deployed"},{name:"Coral L1 yawed boom telescope wrist alternative",role:"coral",points:[[0,380,620],[342,-106,610],[380,-160,560]],radius:28,state:"deployed"},{name:"Coral L2 yawed boom telescope wrist alternative",role:"coral",points:[[0,380,620],[360,-88,950],[400,-140,920]],radius:28,state:"deployed"},{name:"Coral L3 yawed boom telescope wrist alternative",role:"coral",points:[[0,380,620],[378,-70,1370],[420,-120,1340]],radius:28,state:"deployed"},{name:"Coral L4 yawed boom telescope wrist alternative",role:"coral",points:[[0,380,620],[378,-97,2050],[420,-150,2020]],radius:28,state:"deployed"},{name:"Algae floor corner yawed telescope shared wrist alternative",role:"algae",points:[[0,380,620],[517.5,-164.5,300],[575,-225,235]],radius:28,state:"deployed"},{name:"Algae reef low yawed telescope shared wrist alternative",role:"algae",points:[[0,380,620],[414,-70,1160],[460,-120,1140]],radius:28,state:"deployed"},{name:"Algae reef high yawed telescope shared wrist alternative",role:"algae",points:[[0,380,620],[414,-70,1620],[460,-120,1600]],radius:28,state:"deployed"},{name:"Algae processor yawed telescope shared wrist alternative",role:"algae",points:[[0,380,620],[414,-70,460],[460,-120,430]],radius:28,state:"deployed"},{name:"Algae net yawed telescope shared wrist placement alternative",role:"algae",points:[[0,380,620],[405,-61,2370],[450,-110,2510]],radius:28,state:"deployed"}],tools:[{name:"Coral floor same shared wrist provisional",role:"coral",center:[360,-230,85],size:[380,220,170],state:"deployed"},{name:"Coral L1 rotated same wrist provisional trough offer",role:"coral",center:[380,-160,560],size:[360,260,200],state:"deployed"},{name:"Coral L2 rotated same wrist provisional insertion",role:"coral",center:[400,-140,920],size:[300,300,240],state:"deployed"},{name:"Coral L3 rotated same wrist provisional insertion",role:"coral",center:[420,-120,1340],size:[300,300,240],state:"deployed"},{name:"Coral L4 rotated same wrist provisional vertical offer",role:"coral",center:[420,-150,2020],size:[260,260,340],state:"deployed"},{name:"Algae floor corner same wrist max-ball allowance provisional",role:"algae",center:[575,-225,235],size:[460,460,470],state:"deployed"},{name:"Algae reef low rotated wrist plus max ball provisional",role:"algae",center:[460,-120,1140],size:[460,460,460],state:"deployed"},{name:"Algae reef high rotated wrist plus max ball provisional",role:"algae",center:[460,-120,1600],size:[460,460,460],state:"deployed"},{name:"Algae processor rotated wrist plus max ball provisional",role:"algae",center:[460,-120,430],size:[460,460,460],state:"deployed"},{name:"Algae net rotated wrist max-ball placement intent only",role:"algae",center:[450,-110,2510],size:[460,460,460],state:"deployed"}],routes:[{name:"Coral loose floor center proposal raised outside bumper to rotated L4 not motion proof",role:"coral",points:[[360,-230,57.15],[360,-230,450],[360,-130,820],[420,-150,2020]]},{name:"Coral station center proposal same retained wrist to rotated L1 not motion proof",role:"coral",points:[[0,-150,1070],[360,-130,820],[380,-160,560]]},{name:"Algae max-ball corner center proposal to retained wrist and processor not proven motion",role:"algae",points:[[595,-245,209.55],[460,-120,600],[460,-120,430]]},{name:"Algae low-reef center proposal to retained wrist and processor not proven motion",role:"algae",points:[[460,-120,1140],[460,-120,600],[460,-120,430]]},{name:"Algae high-reef center proposal to retained wrist and net intent not proven motion",role:"algae",points:[[460,-120,1600],[460,-120,820],[450,-110,2510]]}],annotations:[{at:[0,380,620],text:"Limited yaw; one shared boom"},{at:[595,-245,235],text:"455 mm floor corner extension"},{at:[450,-110,2510],text:"Net rim unknown; pose only"},{at:[0,600,490],text:"Park only; no climber"}]}}];var Zd=[{id:"R07",title:"Low-Mast Partner",family:"Opposed-belt coral transfer to short lift; independent algae telescope; deep cage",strategy:"Cover coral L1-L3 from station or floor, clear either reef algae tier for partners, and deliver algae to processor. Retain a deep-cage option. Alliance coverage, not a predicted throughput or stability advantage, motivates this concept.",tradeoff:"No L4 or net. At equal success, L4 beats L3 TELEOP rate only below a 25% cycle-time premium (5/4); equality ties. Times are unmeasured. A lower center of mass is a hypothesis, not computed.",firstTest:"Check upper-grip floor algae and processor release at the shared low-head pose against measured geometry; verify both reef heights separately. Then bench-test belt-to-lift retention and the deep hook/load path. No physical tests have run.",capabilities:{coralLevels:[1,2,3],coralSources:["station","floor"],algaeSources:["reefLow","reefHigh","floor"],algaeDestinations:["processor"],climb:"deep",simultaneousCarry:!1},subsystems:{drive:"Use the provided common 700 x 760 chassis, four drive-module envelopes and intact bumper ring; no duplicate chassis geometry or bumper cutout. X60/X44 drives and WCP interfaces are candidates only; ratios, power, mass and stability remain unsized.",coral:"Opposed compliant belts maintain contact over the front bumper, then align coral lengthwise (+y axis) into the short-lift wrist. Confirm wrist grip before releasing belts. Station feed enters that wrist directly. Proposed wrist pitch offers L1-L3; tool centers are not station/branch datums or insertion proofs. Nominal coral is OD114.3 x L301.625 mm; belts, alignment and pitch remain untested.",algae:"A dedicated pivoting short telescope owns one roller head. ReefLow/reefHigh heights are unknown: z1080/1520 are provisional tool-center intents pending measurement. Shared z410 low-head pose proposes floor upper-grip and processor offer using different wrist/ball contacts, not measured release geometry. Algae OD412.75 +/-6.35 mm; grip, tolerances and controlled-ball swept bounds remain open. No net.",climb:"Deep setting is selected with field staff before play. Rear winch crossmember ties both rails to a hook boom; stowed and deployed links explicitly join hook to base. Drawn hook z360 is a proposal, not cage-bottom or contact height. Winch lock, engagement, ANCHOR avoidance, frame loads and carpet clearance are unverified; cage contact alone is not a climb.",packaging:"Reserve separate rear-left battery and right-front electrical boxes alongside the mechanisms, with rear battery lift-out and top electrical service access. Keep the center deck largely open. Use router-cut aluminum/polycarbonate plates, tubes, spacers and printed guides, not accurate metal bends. Mount boxes on chassis brackets; service clearances and battery fit await verification.",control:"Independent actuators, but serialize coral/algae carrying. Track one of each under G409 and inhibit acquisition if occupancy/location is unknown. Positive transfer confirmation, guarded release/jam recovery and climb/stow interlock are required. Tools/links sharing an owner show mutually exclusive pose samples, not duplicate mechanisms; all views use this one 3D dataset. Base remains; stowed/deployed are alternative states.",stow:"Fold belt carrier, lower short-lift wrist, retract algae head into its rear cradle and latch deep hook. Clear both pieces before climb. Nominal box half-sizes and link radii must fit x+/-350, y0..760, z<=1066.8 in base/stow; deploy uses the 420 mm sketch margin. Tool envelopes are hardware, not game-piece solids; all centers are proposed, not measured field datums. Sweeps and retained-piece bounds are unverified."},cycle:{auto:"Coordinate LEAVE and an intended preload L2/L3 placement with partners; the drawing is not an autonomous reach or success test. Add station/floor acquisition only after possession and collision guards are demonstrated. No net or L4 routine.",coral:"Floor: belt nip -> over-bumper retention -> lengthwise alignment -> confirmed wrist handoff -> short lift -> L1/L2/L3 offer -> release and retreat. Station: receive directly in the same wrist. One coral throughout; separately test loose and initially algae-stacked floor cases rather than ingesting both blindly.",algae:"Stow coral path; use the same algae head at floor or provisional low/high reef pose. Retain, retract over the intact bumper, drive to processor and offer from the shared low-head pose. Different contacts/locations require testing. A processor score gives 6 to us; a later opponent HP net score gives them 4, not us 10.",endgame:"Stop acquisition, clear pieces, lower coral and latch algae stow. Approach the preselected deep cage; deploy hook from its rail-tied base and tension the winch under a future verified load limit. Confirm legal support and carpet clearance. Abort to park when appropriate; deep and park are alternatives, not additive."},inspiration:[{source:"research/2025-coral/1690-1778.md",lesson:"Local report, 1690 E03: the author reports separating acquisition from orientation and a rear-roller deletion that produced a transfer dead spot. That supports checking continuous contact at the installed handoff. These opposed belts, dimensions, short lift, algae telescope and deep climb are original proposals, not a measured 1690 replica or reported team capabilities."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"Conditional Value Checks: L4 wins the L3 TELEOP point-rate comparison only if 5*p4/t4 > 4*p3/t3. Equal success gives the 1.25 cycle-time boundary; 25% is an equality premium, not measured time saved by omitting L4. Access, RP value, penalties and partner coverage can change the decision. Lower center of mass has not been calculated."},{source:"https://firstfrc.blob.core.windows.net/frc2025/Manual/2025GameManual.pdf",lesson:"Use the locally verified manual scope in GAME-ANALYSIS: pp.23-34 field/piece references, pp.45-50 scoring and cage conditions, G409 occupancy and R101-R105/R401/R405 envelopes and intact bumpers. Branch tips, station bottom and cage bottom are not tool centers. Unknown reef-algae heights remain unknown; these acquisition, scoring and hook poses are unverified proposals."}],geometry:{boxes:[{name:"Short coral mast on front-left rail bracket",role:"structure",center:[-170,285,590],size:[100,100,820],state:"base"},{name:"Coral short-lift carriage and wrist stowed",role:"coral",center:[-170,285,430],size:[320,220,220],state:"stowed"},{name:"Opposed-belt pickup folded carrier",role:"coral",center:[-170,110,510],size:[280,160,240],state:"stowed"},{name:"Independent algae telescope pivot and drive",role:"algae",center:[210,420,310],size:[120,100,180],state:"base"},{name:"Algae roller head rear retention stow",role:"algae",center:[100,535,790],size:[460,180,160],state:"stowed"},{name:"Deep winch and brake on rear crossmember",role:"climb",center:[0,620,235],size:[180,130,170],state:"base"},{name:"Deep hook boom latched stow",role:"climb",center:[0,700,510],size:[200,80,180],state:"stowed"},{name:"Deep hook proposed engagement, not cage datum",role:"climb",center:[0,1050,360],size:[210,100,160],state:"deployed"},{name:"Battery reserve, rear-left lift-out access",role:"electrical",center:[-235,535,240],size:[160,230,180],state:"base"},{name:"Electrical reserve, right-front top access",role:"electrical",center:[215,235,215],size:[190,220,130],state:"base"}],links:[{name:"Coral mast rail foot and fixed guide",role:"structure",points:[[-285,285,150],[-170,285,190],[-170,285,990]],radius:18,state:"base"},{name:"Coral belt carrier floor proposal from lift handoff",role:"coral",points:[[-170,285,430],[-170,110,510],[-170,-125,310],[-170,-280,115]],radius:18,state:"deployed"},{name:"Coral wrist station alternative from short lift",role:"coral",points:[[-170,285,430],[-170,285,1020],[-170,-200,1060]],radius:16,state:"deployed"},{name:"Coral wrist L1 alternative from short lift",role:"coral",points:[[-170,285,430],[-170,-200,540]],radius:16,state:"deployed"},{name:"Coral wrist L2 alternative from short lift",role:"coral",points:[[-170,285,430],[-170,285,880],[-170,-200,900]],radius:16,state:"deployed"},{name:"Coral wrist L3 alternative from short lift",role:"coral",points:[[-170,285,430],[-170,285,1260],[-170,-200,1300]],radius:16,state:"deployed"},{name:"Algae telescope rail anchor",role:"structure",points:[[285,420,150],[210,420,310]],radius:18,state:"base"},{name:"Algae telescope folded to rear head stow",role:"algae",points:[[210,420,310],[210,420,650],[100,535,790]],radius:22,state:"stowed"},{name:"Algae head shared floor-processor low-pose alternative",role:"algae",points:[[210,420,310],[210,160,650],[0,-275,410]],radius:22,state:"deployed"},{name:"Algae head reef low alternative, reach unverified",role:"algae",points:[[210,420,310],[210,160,820],[160,-200,1080]],radius:22,state:"deployed"},{name:"Algae head reef high alternative, reach unverified",role:"algae",points:[[210,420,310],[210,220,1250],[160,-200,1520]],radius:22,state:"deployed"},{name:"Deep winch rail-to-rail load crossmember, unverified",role:"climb",points:[[-260,620,150],[0,620,235],[260,620,150]],radius:22,state:"base"},{name:"Deep hook stowed boom to winch base",role:"climb",points:[[0,620,235],[0,700,510]],radius:25,state:"stowed"},{name:"Deep hook deployed boom to winch base, unverified",role:"climb",points:[[0,620,235],[0,820,610],[0,1050,360]],radius:25,state:"deployed"},{name:"Deep hook proposed winch tension return",role:"climb",points:[[0,1050,360],[0,620,235]],radius:8,state:"deployed"}],tools:[{name:"Coral floor belt nip proposed center",role:"coral",center:[-170,-280,115],size:[320,220,220],state:"deployed"},{name:"Coral station wrist proposed center",role:"coral",center:[-170,-200,1060],size:[320,220,220],state:"deployed"},{name:"Coral L1 wrist proposed offer center",role:"coral",center:[-170,-200,540],size:[320,220,220],state:"deployed"},{name:"Coral L2 wrist proposed offer center",role:"coral",center:[-170,-200,900],size:[320,220,220],state:"deployed"},{name:"Coral L3 wrist proposed offer center",role:"coral",center:[-170,-200,1300],size:[320,220,220],state:"deployed"},{name:"Algae floor / processor shared low-head proposed center",role:"algae",center:[0,-275,410],size:[460,180,160],state:"deployed"},{name:"Algae reef low proposed head center, height unknown",role:"algae",center:[160,-200,1080],size:[460,180,160],state:"deployed"},{name:"Algae reef high proposed head center, height unknown",role:"algae",center:[160,-200,1520],size:[460,180,160],state:"deployed"}],routes:[{name:"Coral floor to belt retention to wrist to L3 example",role:"coral",points:[[-170,-280,115],[-170,-125,310],[-170,110,510],[-170,285,430],[-170,285,1260],[-170,-200,1300]]},{name:"Coral station to same wrist retention to L2 example",role:"coral",points:[[-170,-200,1060],[-170,285,430],[-170,285,880],[-170,-200,900]]},{name:"Algae floor to retention to processor, same low head at different robot locations",role:"algae",points:[[0,-275,410],[100,535,790],[0,-275,410]]},{name:"Algae high retract via low waypoint to retention to processor",role:"algae",points:[[160,-200,1520],[160,-200,1080],[100,535,790],[0,-275,410]]}],annotations:[{at:[-170,-200,1300],text:"Proposed centers; no field datum"},{at:[160,-200,1520],text:"One head, alternative poses"},{at:[0,1050,360],text:"Deep load path unverified"},{at:[-235,535,240],text:"Rear battery lift-out"}]}},{id:"R08",title:"Wide-Mouth Cycle Partner",family:"Broad coral tip-roller carrier to small scoring arm; independent low algae arm; shallow cage",strategy:"Limit reach for alliance coverage: seek frequent L1/L2 coral cycles from station or floor, plus floor/low-reef algae to processor and a shallow climb. Simplicity is a design intent, not a measured reliability or best-robot claim.",tradeoff:"Omit coral L3/L4, high-reef algae, net and deep climb. Partners must cover those scoring/reach gaps. Broad capture needs orientation and handoff tests; fewer reach stages do not establish faster cycles or lower total integration effort.",firstTest:"Test the broad mouth with off-angle coral, carrier-fixed lower contact and deliberately offset receiver. Check low-reef/processor poses against measurements, then prove shallow-hook retention and load path. These tests have not run.",capabilities:{coralLevels:[1,2],coralSources:["station","floor"],algaeSources:["floor","reefLow"],algaeDestinations:["processor"],climb:"shallow",simultaneousCarry:!1},subsystems:{drive:"Retain the provided common chassis, four drive modules and continuous bumper ring without a cutout. Driver-assisted heading correction is an intended recovery option, not orientation-independent pickup. X60/X44 and WCP choices remain candidates; no motor ratio, power, mass or cycle time is established.",coral:"A proposed 600 mm broad carrier captures coral crosswise (+x axis). During raising, guides center it; a powered tip roller pushes against lower contact locked to the moving carrier, not world. Handoff is to a grip-confirmed cradle on a small folding scoring arm with its own drive, not R07's elevator. That cradle also receives station coral and offers L1/L2. Coral OD114.3 x L301.625 mm; all tool centers/pitch are proposals, not field datums.",algae:"Independent short folding arm and compliant roller head handle floor and reefLow only, retaining then offering to processor. Low-reef z1060 is a provisional tool center pending measurement; reef algae height remains unknown. Floor z270 and processor z480 are proposed head centers, not measured ball centers or opening datums. Algae OD412.75 +/-6.35 mm. High-reef reach and net are intentionally absent; grip and full controlled-ball bounds remain unverified.",climb:"Preselect shallow cage with field staff. Rear winch cradle transfers hook load into both chassis rails; separate stowed/deployed hook links explicitly return to the base. Proposed hook z1040 is not the 765.175 cage-bottom datum or an established engagement point. Brake, hook lock, frame loads, ANCHOR avoidance and no-carpet-contact qualification remain unverified. No deep-climb mode.",packaging:"Use sparse flat aluminum/polycarbonate plates, spacers, tubes and printed centering guides without precision bends. Rear-left battery and right-front electrical boxes remain alongside the mechanisms, with rear battery lift-out and top electronics access. The compact coral arm avoids a tall lift bay; this is a packaging hypothesis, not computed mass savings. Check real battery, cables and service sweep later.",control:"Serialize carrying despite independent coral/algae drives. One-piece occupancy, positive cradle grip before carrier release, and possession-versus-centering checks are mandatory. Inhibit unknown occupancy/location, guard release and jam recovery, and interlock climb with stow. Each owner's tool/link poses are alternatives in the same 3D dataset, not duplicate arms; all views share base plus stowed/deployed state selection.",stow:"Raise and latch broad carrier, fold scoring cradle above its drive, fold algae head into rear retention and latch shallow hook. Clear pieces before climb. Base/stow half-size/radius bounds must fit x+/-350, y0..760, z<=1066.8; deployed hardware uses the 420 mm sketch margin. Tool boxes bound hardware, not whole pieces. All centers are provisional; unmodeled joints, sweeps, retained-piece clearance and service access remain open."},cycle:{auto:"Coordinate LEAVE and a preload L1/L2 placement with the alliance; no higher-level routine. Add a station or floor acquisition only after carrier ownership and receiver alignment guards work. Frequent low-level cycling is an intended role, not a measured autonomous count or time.",coral:"Floor: broad capture -> retain while raising/centering -> powered tip against carrier-fixed lower contact -> confirmed scoring-cradle grip -> small-arm L1/L2 offer -> release. Station feeds that cradle directly. Presence alone does not confirm centering. Test loose and algae-stacked starts separately and avoid a second controlled coral.",algae:"Park coral mechanism, capture one floor or low-reef algae, confirm roller retention, retract over the intact bumper, drive to processor and release under location guard. Do not attempt high-reef removal or net. Processor gives 6 own points; a subsequent opponent HP conversion is 4 opponent points, not 10 own points.",endgame:"End cycles, clear both pieces and latch carrier/cradle/algae stow. Deploy rail-connected shallow hook toward the preselected cage, confirm retention and tension the winch only after load proof. Test legal hanging clear of carpet and ANCHORS. Choose a park abort when justified; shallow and park are mutually exclusive scores."},inspiration:[{source:"research/2025-coral/1690-1778.md",lesson:"1778 E07-E11 are author-reported: raising/centering, presence sensing that is not centering sensing, fixed lower axle needed for handoff, and sensitivity to receiver alignment. E10 describes driver-assisted rotation, not universal-angle capture. Our 600 mm broad mouth, carrier geometry, small scoring arm, algae path and shallow climb are original proposals, not a measured 1778 replica."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"The lower-reach family is conditional on alliance complementarity, not evidence that simplicity produces fast cycles. R08 intentionally goes below the L1-L3 example to L1/L2 and reefLow only. Reef clearing earns no removal points; any partner access benefit is conditional. A shallow-climb choice still needs its own time, reliability and load-path evidence."},{source:"https://firstfrc.blob.core.windows.net/frc2025/Manual/2025GameManual.pdf",lesson:"Locally verified scope: pp.23-34 separates field datums from mechanism poses; pp.45-50 defines scoring/cages; G409 governs whole-robot occupancy, including handoffs; R101-R105 and R401/R405 govern size and intact bumpers. No manual datum is a measured manipulator center. L1 is a trough, not a branch; cage contact alone does not qualify a shallow climb."}],geometry:{boxes:[{name:"Broad coral carrier pivot crossbar",role:"coral",center:[0,170,295],size:[500,90,150],state:"base"},{name:"Tip-roller carrier with locked lower contact, stowed",role:"coral",center:[0,170,540],size:[600,230,260],state:"stowed"},{name:"Small coral scoring-arm drive and shoulder",role:"coral",center:[-205,350,360],size:[130,150,180],state:"base"},{name:"Coral scoring cradle retained stow",role:"coral",center:[-100,425,630],size:[360,180,180],state:"stowed"},{name:"Independent low-algae arm pivot and drive",role:"algae",center:[230,460,305],size:[100,120,210],state:"base"},{name:"Algae roller head folded rear stow",role:"algae",center:[100,595,890],size:[460,180,160],state:"stowed"},{name:"Shallow winch and brake rear cradle",role:"climb",center:[0,660,260],size:[150,120,180],state:"base"},{name:"Shallow hook latched stow",role:"climb",center:[0,695,450],size:[200,90,160],state:"stowed"},{name:"Shallow hook proposed engagement, not cage datum",role:"climb",center:[0,1040,1040],size:[210,120,160],state:"deployed"},{name:"Battery reserve, rear-left lift-out access",role:"electrical",center:[-230,630,235],size:[160,220,170],state:"base"},{name:"Electrical reserve, right-front top access",role:"electrical",center:[220,245,235],size:[170,180,150],state:"base"}],links:[{name:"Coral carrier and small-arm chassis anchor brackets",role:"structure",points:[[285,170,150],[0,170,295],[-285,170,150],[-285,350,150],[-205,350,360]],radius:18,state:"base"},{name:"Coral carrier folded about its own pivot",role:"coral",points:[[0,170,295],[0,170,540]],radius:18,state:"stowed"},{name:"Coral broad carrier floor pose over intact bumper",role:"coral",points:[[0,170,295],[0,-125,310],[0,-270,150]],radius:18,state:"deployed"},{name:"Coral powered tip transfer to small-arm cradle",role:"coral",points:[[0,170,540],[-100,335,630],[-100,425,630]],radius:12,state:"stowed"},{name:"Coral small scoring arm folded to retained cradle",role:"coral",points:[[-205,350,360],[-100,425,630]],radius:20,state:"stowed"},{name:"Coral small-arm station alternative from shoulder",role:"coral",points:[[-205,350,360],[-100,170,820],[-100,-180,1050]],radius:20,state:"deployed"},{name:"Coral small-arm L1 alternative from shoulder",role:"coral",points:[[-205,350,360],[-100,110,510],[-100,-180,510]],radius:20,state:"deployed"},{name:"Coral small-arm L2 alternative from shoulder",role:"coral",points:[[-205,350,360],[-100,100,760],[-100,-180,890]],radius:20,state:"deployed"},{name:"Algae pivot and shallow winch rail load brackets",role:"structure",points:[[230,460,305],[285,460,150],[285,660,150],[0,660,260],[-285,660,150]],radius:20,state:"base"},{name:"Algae short arm folded to rear retention",role:"algae",points:[[230,460,305],[230,460,680],[100,595,890]],radius:22,state:"stowed"},{name:"Algae short-arm floor alternative from pivot",role:"algae",points:[[230,460,305],[230,120,620],[60,-265,270]],radius:22,state:"deployed"},{name:"Algae short-arm reef low alternative, height unknown",role:"algae",points:[[230,460,305],[230,120,820],[170,-180,1060]],radius:22,state:"deployed"},{name:"Algae short-arm processor offer alternative",role:"algae",points:[[230,460,305],[230,120,620],[210,-190,480]],radius:22,state:"deployed"},{name:"Shallow hook stowed load link to winch base",role:"climb",points:[[0,660,260],[0,695,450]],radius:24,state:"stowed"},{name:"Shallow hook deployed boom and internal tension path to base, unverified",role:"climb",points:[[0,660,260],[0,830,710],[0,1040,1040]],radius:24,state:"deployed"}],tools:[{name:"Coral floor broad carrier proposed center",role:"coral",center:[0,-270,150],size:[600,230,260],state:"deployed"},{name:"Coral station small-arm cradle proposed center",role:"coral",center:[-100,-180,1050],size:[360,180,180],state:"deployed"},{name:"Coral L1 small-arm cradle proposed offer center",role:"coral",center:[-100,-180,510],size:[360,180,180],state:"deployed"},{name:"Coral L2 small-arm cradle proposed offer center",role:"coral",center:[-100,-180,890],size:[360,180,180],state:"deployed"},{name:"Algae floor proposed head center",role:"algae",center:[60,-265,270],size:[460,180,160],state:"deployed"},{name:"Algae reef low proposed head center, height unknown",role:"algae",center:[170,-180,1060],size:[460,180,160],state:"deployed"},{name:"Algae processor proposed head offer center",role:"algae",center:[210,-190,480],size:[460,180,160],state:"deployed"}],routes:[{name:"Coral floor carrier to crosswise retention to small-arm L1 example",role:"coral",points:[[0,-270,150],[0,-125,310],[0,170,540],[-100,425,630],[-100,-180,510]]},{name:"Coral station direct cradle retention to small-arm L2 example",role:"coral",points:[[-100,-180,1050],[-100,425,630],[-100,-180,890]]},{name:"Algae floor to independent retention to processor",role:"algae",points:[[60,-265,270],[100,595,890],[210,-190,480]]},{name:"Algae low reef to same retention to processor",role:"algae",points:[[170,-180,1060],[100,595,890],[210,-190,480]]}],annotations:[{at:[0,170,540],text:"Lower contact locked to carrier"},{at:[-100,-180,1050],text:"Proposed centers; no field datum"},{at:[170,-180,1060],text:"One head, alternative poses"},{at:[0,1040,1040],text:"Shallow load path unverified"}]}}];var Jd=[{id:"R09",title:"Algae-First Hybrid",family:"Algae-priority retained elevator and flywheel feed with low rear coral arm",strategy:"Prioritize algae clearing and net-shot intent, retaining a processor choice for alliance needs. Rear station/floor coral covers L1-L3; deliberately omit L4 and simultaneous carry to concentrate effort on algae and deep climb.",tradeoff:"Unlike R03's station-first L4 coral role, a large algae cradle, flywheels and transfer controls dominate packaging. No L4, net placement or dual carry; deep climb and launch repeatability remain high-risk hypotheses.",firstTest:"Sweep the largest algae from floor over intact bumpers into the retained cradle, then test feed ownership. Overlay folded coral links, cable loops and deep hook with battery access before selecting motors.",capabilities:{coralLevels:[1,2,3],coralSources:["station","floor"],algaeSources:["reefLow","reefHigh","floor"],algaeDestinations:["processor","net"],climb:"deep",simultaneousCarry:!1},subsystems:{drive:"Common 700 x 760 chassis; renderer supplies four drive envelopes and intact bumper ring x+/-435, y-85..845, z45..165. Starting perimeter is 2920 mm. Front algae and rear coral approaches need different alignment modes. Travel with retained tool low; elevated operation and deep-climb approach need stability/contact guards, not an invented speed or mass limit.",coral:"Rear folding two-link low arm carries opposed driven rollers, backstop and gate. The same wrist accepts station coral or lowers outside the rear bumper, then lifts floor coral over it with continuous retention. Wrist alignment serves L1-L3 offers; L4 is deliberately absent. All tool centers and sizes are proposals, not performance, solved joints or branch-insertion proof.",algae:"Wide retained-cradle elevator, folding upper stage and folding wrist collect reefLow/reefHigh/floor, then raise over intact bumpers. Opposed contacts and backstop retain through a confirmed handoff to flywheel feed. An exclusive low processor gate bypasses the wheels, not a free-fall chute. Reef centers, net rim and processor target remain unknown. All tool poses are proposals; net-shot route is illustration, not ballistics.",climb:"Left-rear flat-plate hook arm pivots on chassis gussets and folds vertically. A chassis winch, pivot fairlead and arm tether close the proposed load loop to one own-alliance deep cage. Hook contact is not the cage-bottom datum. Latch, brake, strength, ANCHOR exclusion and carpet clearance remain unproved; field staff select deep before the match. No shallow mechanism is claimed.",packaging:"Battery and rear extraction lane sit below coral wrist; disabled pit service removes the rear bumper segment, never a match intake gap. Right electrical plate and cable folds reserve access. Metric router-cut aluminum/polycarbonate plates, spacers, lathe shafts and printed guides; no accurate bends. Motors, ratios and mass are deferred. Tool boxes are hardware envelopes, not full controlled-piece sweeps or clearance proof.",control:"Whole-robot one-of-each counters include stuck/herded pieces, but R09 serializes types. Wrist -> cradle -> feed ownership transfers only on confirmed capture, before upstream release. Processor/flywheel gates exclude each other. Unknown occupancy/location stops acquire/release; jams stop and retain. Coral release needs own reef; no out-of-field ejection except processor. Net/opponent-cage/ANCHOR contact and protected-zone guards gate motion.",stow:"Latch algae upper stage beside mast and cradle inside plan; gates shut, flywheels stopped. Fold coral links and capture both cable/reeving loops in side channels; fold rear hook. Climb requires empty paths, confirmed lift/arm/tool stow, cable clearance and latches before winching. Base/stow boxes and link radii fit 700 x 760 x 1066.8; deployed hardware targets 420 mm extension. Alternative poses are not concurrent assemblies; sweeps remain unproved."},cycle:{auto:"Coordinate LEAVE and a retained L2/L3 preload with partners; no L4 auto claim. Only attempt a selected algae source after coral release and occupancy confirmation. Robot net launch is an optional later proof gate, not an assumed autonomous success; no human-player algae entry in AUTO.",coral:"Require algae path empty. Receive at rear station or grip loose floor coral outside rear bumper; maintain pinch/backstop while raising over it. Align retained coral and offer L1, L2 or L3, release only at guarded own-reef location, confirm empty and fold. No intermediate second-coral buffer or L4 cycle.",algae:"Require coral empty. Treat loose algae and algae-on-coral marks separately; reject collateral coral control. Grip floor or proposed low/high reef pose, raise and retract under retention. Confirm capture before feeding flywheels, or select processor outlet. Processor gives 6 to us but supplies opposing HP; net gives 4 to net owner, not 10 to us.",endgame:"Finish a guarded release; never dump to clear climb. Confirm both paths empty, stop flywheels, fold/latch lifts, wrist and coral arm, and contain cables. Deploy left hook toward selected own deep cage, latch and winch only after engagement confirmation. Exactly one cage, no ANCHOR/carpet contact; park fallback is not additive cage scoring."},inspiration:[{source:"trials/whole-robot-concepts/BRIEF.md",lesson:"Original Stage 2 algae-first proposal, not an author-reported team robot or measured replica. R03 is distinguished by the task's station-first L4 role: here the rear coral arm is lower reach and algae packaging/control owns the design effort."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"Apply conditional algae-clearing and processor-versus-net value, without awarding clearance points or assuming launch success. Keep field-height unknowns separate from proposed tool centers; retained contact loops and deep cage engagement still need proof."},{source:"trials/whole-robot-concepts/game.json",lesson:"Use one-of-each legal occupancy as an upper bound, not a mechanical requirement. R09 intentionally serializes pieces. Maximum nominal algae diameter is 419.1 mm; complete ball/contact sweeps remain a first-test gate, not something a hardware bounding-box check certifies."}],geometry:{boxes:[{name:"Algae fixed mast and chassis foot",role:"structure",center:[-40,265,525],size:[150,100,650],state:"base"},{name:"Algae upper stage folded beside mast",role:"algae",center:[-40,210,720],size:[100,80,540],state:"stowed"},{name:"Algae retained cradle and opposed contacts",role:"algae",center:[-40,265,520],size:[460,440,440],state:"stowed"},{name:"Algae flywheel housing and gated feed",role:"algae",center:[-40,300,870],size:[500,340,260],state:"base"},{name:"Coral chassis shoulder and bearing plates",role:"coral",center:[140,595,340],size:[100,100,180],state:"base"},{name:"Coral two links folded back together",role:"coral",center:[140,630,690],size:[90,120,560],state:"stowed"},{name:"Coral retained roller wrist with backstop",role:"coral",center:[140,660,435],size:[340,170,160],state:"stowed"},{name:"Deep chassis winch and brake reserve",role:"climb",center:[-240,640,230],size:[140,160,140],state:"base"},{name:"Deep folded hook arm and latch envelope",role:"climb",center:[-240,640,675],size:[100,140,610],state:"stowed"},{name:"Battery reserved volume",role:"electrical",center:[-45,565,225],size:[220,160,190],state:"base"},{name:"Battery rear service lane - keep empty",role:"electrical",center:[-45,690,225],size:[220,100,190],state:"base"},{name:"Right electrical panel and connector access",role:"electrical",center:[265,315,205],size:[140,260,130],state:"base"},{name:"Algae reeving and cable fold channel",role:"electrical",center:[250,275,690],size:[60,180,680],state:"stowed"},{name:"Coral captured wrist cable fold",role:"electrical",center:[295,600,710],size:[50,80,520],state:"stowed"}],links:[{name:"Coral folded shoulder-elbow-wrist chain",role:"coral",points:[[140,595,180],[140,595,430],[140,620,930],[140,660,435]],radius:16,state:"stowed"},{name:"Coral station shoulder-elbow-wrist proposal",role:"coral",points:[[140,595,180],[140,595,430],[140,484,917],[140,960,1070]],radius:16,state:"deployed"},{name:"Coral floor shoulder-elbow-wrist proposal",role:"coral",points:[[140,595,180],[140,595,430],[140,1077,565],[140,1050,65]],radius:16,state:"deployed"},{name:"Coral L1 shoulder-elbow-wrist proposal",role:"coral",points:[[140,595,180],[140,595,430],[140,729,912],[140,1020,505]],radius:16,state:"deployed"},{name:"Coral L2 shoulder-elbow-wrist proposal",role:"coral",points:[[140,595,180],[140,595,430],[140,512,923],[140,1010,875]],radius:16,state:"deployed"},{name:"Coral L3 shoulder-elbow-wrist proposal",role:"coral",points:[[140,595,180],[140,595,430],[140,624,929],[140,980,1280]],radius:16,state:"deployed"},{name:"Algae folded mast-stage-wrist contact support",role:"algae",points:[[-40,265,180],[-40,265,850],[-40,210,990],[-40,210,490],[-40,265,520]],radius:18,state:"stowed"},{name:"Algae floor mast-carriage-folding wrist proposal",role:"algae",points:[[-40,265,180],[-40,265,620],[-40,30,620],[-40,-230,440],[-40,-280,200]],radius:18,state:"deployed"},{name:"Algae reef low mast-carriage-wrist proposal",role:"algae",points:[[-40,265,180],[-40,265,820],[-40,-50,1100],[-40,-230,1e3]],radius:18,state:"deployed"},{name:"Algae reef high raised stage-wrist proposal",role:"algae",points:[[-40,265,180],[-40,265,850],[-40,265,1540],[-40,-50,1640],[-40,-230,1500]],radius:18,state:"deployed"},{name:"Algae processor lowered carriage-gate proposal",role:"algae",points:[[-40,265,180],[-40,265,620],[-40,30,560],[-40,-265,405]],radius:18,state:"deployed"},{name:"Algae net feed support from chassis mast",role:"algae",points:[[-40,265,180],[-40,265,850],[-40,265,870],[-40,230,980]],radius:18,state:"deployed"},{name:"Deep folded chassis pivot-arm-hook",role:"climb",points:[[-240,640,230],[-240,595,350],[-240,595,890],[-240,660,950],[-240,695,900]],radius:14,state:"stowed"},{name:"Deep deployed chassis pivot-arm-hook proposal",role:"climb",points:[[-240,640,230],[-240,595,350],[-240,1e3,600],[-240,1040,700],[-240,1130,700],[-240,1130,630],[-240,1080,630]],radius:14,state:"deployed"},{name:"Deep winch-fairlead-arm tether load return",role:"climb",points:[[-240,640,230],[-240,595,350],[-240,1080,630]],radius:6,state:"deployed"}],tools:[{name:"Coral station proposal",role:"coral",center:[140,960,1070],size:[340,190,180],state:"deployed"},{name:"Coral floor proposal",role:"coral",center:[140,1050,65],size:[340,210,130],state:"deployed"},{name:"Coral L1 proposal",role:"coral",center:[140,1020,505],size:[340,190,180],state:"deployed"},{name:"Coral L2 proposal",role:"coral",center:[140,1010,875],size:[340,190,180],state:"deployed"},{name:"Coral L3 proposal",role:"coral",center:[140,980,1280],size:[340,190,180],state:"deployed"},{name:"Algae floor lower-contact proposal",role:"algae",center:[-40,-280,200],size:[460,210,240],state:"deployed"},{name:"Algae reef low proposal",role:"algae",center:[-40,-230,1e3],size:[460,250,440],state:"deployed"},{name:"Algae reef high proposal",role:"algae",center:[-40,-230,1500],size:[460,250,440],state:"deployed"},{name:"Algae processor outlet proposal",role:"algae",center:[-40,-265,405],size:[460,240,300],state:"deployed"},{name:"Algae net flywheel release proposal",role:"algae",center:[-40,230,980],size:[500,300,240],state:"deployed"}],routes:[{name:"Coral station-retain-L3 center-path proposal",role:"coral",points:[[140,960,1070],[140,900,900],[140,660,435],[140,900,900],[140,980,1280]]},{name:"Coral floor-over-bumper-retain-L1 proposal",role:"coral",points:[[140,1050,65],[140,1050,360],[140,880,520],[140,660,435],[140,1020,505]]},{name:"Coral retained wrist-L2 offer proposal",role:"coral",points:[[140,660,435],[140,900,650],[140,1010,875]]},{name:"Algae floor-retained cradle center-path proposal",role:"algae",points:[[-40,-280,200],[-40,-250,440],[-40,70,520],[-40,265,520]]},{name:"Algae reef low-retained cradle proposal",role:"algae",points:[[-40,-230,1e3],[-40,70,1e3],[-40,265,520]]},{name:"Algae reef high-retained cradle proposal",role:"algae",points:[[-40,-230,1500],[-40,70,1500],[-40,265,520]]},{name:"Algae cradle-processor gated outlet proposal",role:"algae",points:[[-40,265,520],[-40,30,520],[-40,-265,405]]},{name:"Algae net shot route illustration - not ballistics",role:"algae",points:[[-40,265,520],[-40,230,980],[-40,-200,1500],[-40,-350,2350]]}],annotations:[{at:[140,700,1e3],text:"All tool centers are proposals"},{at:[-40,-230,1760],text:"Reef centers / net rim unknown"},{at:[-40,-350,2350],text:"Shot route is not ballistics"},{at:[-45,730,300],text:"Battery exits rear in pit"}]}},{id:"R10",title:"Twin Independent Lifts",family:"Original split-channel folding elevators with independent retained tools",strategy:"Hold one algae low while a separate coral lift cycles L1-L4, avoiding a forced dump only under legal one-of-each occupancy and verified clearance. Later use processor or tentative net placement; choose central-rear shallow climb.",tradeoff:"Omits deep climb and net shooting; does not promise simultaneous scoring. Duplicate folding lifts add width, top mass, reeving and tip risk. Net placement remains conditional on missing rim geometry and loaded clearance.",firstTest:"With largest algae latched low, sweep coral station/floor/L4 and both lift folds against separator, cables and cage arm. Reject dual carry or net placement if clearance, unknown rim reach or loaded stability fails.",capabilities:{coralLevels:[1,2,3,4],coralSources:["station","floor"],algaeSources:["reefLow","reefHigh","floor"],algaeDestinations:["processor","net"],climb:"shallow",simultaneousCarry:!0},subsystems:{drive:"Common 700 x 760 chassis, 2920 mm perimeter; renderer supplies four drive envelopes and intact x+/-435, y-85..845, z45..165 bumper ring. Left coral and front algae approaches use independent alignment frames. Two raised tools are not a permitted travel default. Added width, top mass and overturning risk need loaded tests; no invented drive speed, mass or stability margin.",coral:"Left folding elevator and side-facing wrist use opposed rollers, backstop and gate with no algae handoff. Station and over-side-bumper floor pickup feed one cradle for L1-L4. L2/L3 share the tool shown at L3; L2's proposed center [-575,280,900] is on its separate offer route. All tool centers and sizes are proposals, not reach, insertion or performance proof. Side-by-side channel separation is nominal, not a collision result.",algae:"Right folding elevator with larger retained roller cradle owns reefLow/reefHigh/floor to processor or high net placement; no flywheels or cross-transfer. Opposed contacts and backstop retain while raising over front bumper. Reef centers, processor target and net rim remain unknown; z2500 net tool center is only a proposal. A held algae stays low and latched during coral cycles; simultaneous carry does not mean concurrent scoring or verified full-ball clearance.",climb:"Central-rear shallow hook arm pivots on chassis gussets; chassis winch feeds a fairlead and tether back to the arm, closing a sketched load loop. The arm folds between service bays and deploys only after both lifts latch down. Proposed hook pose is not the 765.175 mm cage-bottom datum. Cage engagement, brake, load capacity, ANCHOR and carpet clearance remain unproved. Field staff select shallow; deep is deliberately omitted.",packaging:"Left coral and wider right algae channel meet a separator; narrow clearances are unverified. Rear-left battery withdraws left through reserved lane with bumper removed only in disabled pit service; rear-right electrical bay remains accessible. Central rear is reserved for climb. Metric router plates, lathe shafts, spacers and printed guides avoid accurate bends. Motor/ratio selection and mass sizing are deferred. Boxes exclude full controlled-piece sweeps.",control:"Independent retained-path owners, no handoff. Whole-robot one-of-each counters include stuck/herded pieces; reject a second of either. Coral cycling while algae held needs low-latch and verified-clearance guards. Unknown occupancy/location inhibits acquire/release; jams stop and retain. Coral release requires own reef; no out-of-field ejection except processor. Net release needs verified aperture/no net contact. Protected-zone/opponent-cage/ANCHOR checks gate motion.",stow:"Retract/fold coral stage pair and algae stage stack into separate channels; latch wrists behind intact bumpers, gates closed. Secure reeving/cable folds in outer channels, away from separator and hook. Climb requires both paths empty, independent stage/wrist latches and cable-clear sensors confirmed. Fold hook rear-center inside plan. Base/stow includes box half-sizes and link radii. Alternative deployed poses are not concurrent hardware or a solved sweep."},cycle:{auto:"Coordinate LEAVE and a selected coral preload offer with alliance partners. Keep algae lift latched until an independently cleared in-match acquisition route and occupancy confirmation permit use. L4 auto and dual carry remain test-gated intentions, not predicted points, timings or automatic RP.",coral:"With one algae held low, verify latch and clearance before acquiring one coral at left station or floor. Raise floor coral over intact side bumper under pinch retention, align and offer L1-L4, confirm legal release and retract. No forced algae dump, but block the coral cycle if either occupancy or mechanical-clearance state is uncertain.",algae:"Acquire one ball from floor or a proposed reef-low/high pose on the right path, latch low and optionally retain through coral cycles. Stacked-mark cases need separate tests and must not control a second piece of either type. Later lower to processor or raise for tentative net placement with no net contact; no ballistic launcher or simultaneous-score claim.",endgame:"Finish legal releases before climb; do not dump a retained ball to bypass a guard. Confirm both paths empty, retract/fold/latch each lift and contain cables. Deploy rear-center hook to selected own shallow cage, verify engagement then tension chassis winch. Exactly one cage, no ANCHOR/carpet contact; park fallback is not additive shallow scoring."},inspiration:[{source:"trials/whole-robot-concepts/BRIEF.md",lesson:"Original high-complexity proposal with two genuinely separate folding elevators, retained tools and ownership channels. No team is credited with this arrangement; neither depicted tool is a duplicate of a shared mechanism pretending to be independent."},{source:"trials/whole-robot-concepts/game.json",lesson:"G409 permits one coral and one algae, not unrestricted multi-piece storage. Holding an algae through coral cycles can avoid a forced dump only if loaded separation is demonstrated. Net rim remains null; the high placement sketch is deliberately conditional, not a reachable field target."},{source:"trials/whole-robot-concepts/GAME-ANALYSIS.md",lesson:"Full coral and both algae destinations do not imply a best-at-everything robot. This concept sacrifices deep climb and net shooting, and pays for independence with width, upper structure, cable management and stability risk. Cage poses and scoring offers are not qualification proofs."}],geometry:{boxes:[{name:"Coral left fixed mast and chassis foot",role:"structure",center:[-235,520,530],size:[110,90,680],state:"base"},{name:"Coral upper stage pair folded in left channel",role:"coral",center:[-265,535,650],size:[70,110,740],state:"stowed"},{name:"Coral independent retained wrist",role:"coral",center:[-235,280,520],size:[180,340,180],state:"stowed"},{name:"Coral outer reeving and cable fold",role:"electrical",center:[-332,470,645],size:[24,180,750],state:"stowed"},{name:"Algae right fixed mast and chassis foot",role:"structure",center:[90,520,540],size:[170,100,700],state:"base"},{name:"Algae upper stage stack folded in right channel",role:"algae",center:[180,540,645],size:[90,100,750],state:"stowed"},{name:"Algae independent retained cradle",role:"algae",center:[90,265,535],size:[450,440,440],state:"stowed"},{name:"Algae outer reeving and cable fold",role:"electrical",center:[328,445,650],size:[24,180,740],state:"stowed"},{name:"Battery rear-left reserved volume",role:"electrical",center:[-175,655,225],size:[230,170,190],state:"base"},{name:"Electrical rear-right service bay",role:"electrical",center:[195,660,225],size:[240,160,170],state:"base"},{name:"Shallow central chassis winch and brake reserve",role:"climb",center:[0,650,225],size:[110,160,150],state:"base"},{name:"Shallow hook arm folded between rear bays",role:"climb",center:[0,645,650],size:[100,130,660],state:"stowed"},{name:"Battery left extraction lane - keep empty",role:"electrical",center:[-320,655,225],size:[60,170,190],state:"base"},{name:"Nominal flat-plate channel separator",role:"structure",center:[-140,370,540],size:[10,310,630],state:"base"},{name:"Shallow chassis pivot gussets and fairlead",role:"climb",center:[0,590,330],size:[100,70,140],state:"base"}],links:[{name:"Coral left folded mast-stage-wrist chain",role:"coral",points:[[-235,520,180],[-235,520,850],[-265,535,1e3],[-265,535,350],[-235,280,520]],radius:16,state:"stowed"},{name:"Coral station left mast-carriage-wrist proposal",role:"coral",points:[[-235,520,180],[-235,520,850],[-235,520,1060],[-235,280,1060],[-540,280,1060]],radius:16,state:"deployed"},{name:"Coral floor left mast-folding wrist proposal",role:"coral",points:[[-235,520,180],[-235,520,340],[-235,280,340],[-550,280,340],[-610,280,65]],radius:16,state:"deployed"},{name:"Coral L1 left mast-carriage-wrist proposal",role:"coral",points:[[-235,520,180],[-235,520,520],[-235,280,520],[-575,280,520]],radius:16,state:"deployed"},{name:"Coral L2-L3 carriage alternatives - shown L3",role:"coral",points:[[-235,520,180],[-235,520,850],[-235,520,900],[-235,520,1290],[-235,280,1290],[-575,280,1290]],radius:16,state:"deployed"},{name:"Coral L4 left raised stages-wrist proposal",role:"coral",points:[[-235,520,180],[-235,520,850],[-235,520,1460],[-235,520,1920],[-235,280,1920],[-575,280,1920]],radius:16,state:"deployed"},{name:"Algae right folded mast-stage-cradle chain",role:"algae",points:[[90,520,180],[90,520,870],[180,540,1e3],[180,540,330],[90,265,535]],radius:18,state:"stowed"},{name:"Algae floor right mast-folding cradle proposal",role:"algae",points:[[90,520,180],[90,520,620],[90,220,620],[90,-230,440],[90,-285,200]],radius:18,state:"deployed"},{name:"Algae reef low right mast-cradle proposal",role:"algae",points:[[90,520,180],[90,520,870],[90,520,1060],[90,180,1100],[90,-240,1e3]],radius:18,state:"deployed"},{name:"Algae reef high right raised stages proposal",role:"algae",points:[[90,520,180],[90,520,870],[90,520,1540],[90,180,1640],[90,-240,1520]],radius:18,state:"deployed"},{name:"Algae processor right mast-cradle proposal",role:"algae",points:[[90,520,180],[90,520,620],[90,180,560],[90,-250,405]],radius:18,state:"deployed"},{name:"Algae net placement right stage stack proposal",role:"algae",points:[[90,520,180],[90,520,870],[90,520,1560],[90,520,2240],[90,520,2550],[90,180,2550],[90,-200,2500]],radius:18,state:"deployed"},{name:"Shallow folded chassis pivot-arm-hook",role:"climb",points:[[0,650,225],[0,590,360],[0,610,880],[0,660,950],[0,690,900]],radius:14,state:"stowed"},{name:"Shallow deployed chassis pivot-arm-hook proposal",role:"climb",points:[[0,650,225],[0,590,360],[0,880,790],[0,1020,1010],[0,1100,1010],[0,1100,940],[0,1060,940]],radius:14,state:"deployed"},{name:"Shallow winch-fairlead-arm tether load return",role:"climb",points:[[0,650,225],[0,590,360],[0,1060,940]],radius:6,state:"deployed"}],tools:[{name:"Coral station proposal",role:"coral",center:[-540,280,1060],size:[180,340,180],state:"deployed"},{name:"Coral floor proposal",role:"coral",center:[-610,280,65],size:[180,340,130],state:"deployed"},{name:"Coral L1 proposal",role:"coral",center:[-575,280,520],size:[180,340,180],state:"deployed"},{name:"Coral L2/L3 proposal - shown L3",role:"coral",center:[-575,280,1290],size:[180,340,180],state:"deployed"},{name:"Coral L4 proposal",role:"coral",center:[-575,280,1920],size:[180,340,180],state:"deployed"},{name:"Algae floor lower-contact proposal",role:"algae",center:[90,-285,200],size:[450,220,240],state:"deployed"},{name:"Algae reef low proposal",role:"algae",center:[90,-240,1e3],size:[450,280,440],state:"deployed"},{name:"Algae reef high proposal",role:"algae",center:[90,-240,1520],size:[450,280,440],state:"deployed"},{name:"Algae processor placement proposal",role:"algae",center:[90,-250,405],size:[450,260,320],state:"deployed"},{name:"Algae net placement proposal - rim unknown",role:"algae",center:[90,-200,2500],size:[450,300,450],state:"deployed"}],routes:[{name:"Coral station-left retention-L4 proposal",role:"coral",points:[[-540,280,1060],[-235,280,1060],[-235,280,520],[-235,280,1920],[-575,280,1920]]},{name:"Coral floor-over-side-bumper-L1 proposal",role:"coral",points:[[-610,280,65],[-610,280,350],[-235,280,520],[-575,280,520]]},{name:"Coral L2 separate offer center proposal",role:"coral",points:[[-235,280,520],[-235,280,900],[-575,280,900]]},{name:"Coral L3 separate offer center proposal",role:"coral",points:[[-235,280,520],[-235,280,1290],[-575,280,1290]]},{name:"Algae floor-over-front-bumper-low retention proposal",role:"algae",points:[[90,-285,200],[90,-250,450],[90,80,535],[90,265,535]]},{name:"Algae reef low-right low retention proposal",role:"algae",points:[[90,-240,1e3],[90,80,1e3],[90,265,535]]},{name:"Algae reef high-right low retention proposal",role:"algae",points:[[90,-240,1520],[90,80,1520],[90,265,535]]},{name:"Algae retained-low processor offer proposal",role:"algae",points:[[90,265,535],[90,80,535],[90,-250,405]]},{name:"Algae retained-net placement intent - no ballistic path",role:"algae",points:[[90,265,535],[90,265,1800],[90,265,2500],[90,-200,2500]]}],annotations:[{at:[-235,280,1550],text:"All tool centers are proposals"},{at:[90,-200,2780],text:"Net rim / reef centers unknown"},{at:[-575,280,900],text:"L2 offer proposal: z900"},{at:[90,265,535],text:"Hold algae low; clearance gate"}]}}];var Es=[...Yd,...$d,...Zd,...Jd],Ts={stow:"Collapsed / stow intent","coral-floor":"Coral / floor pickup","coral-station":"Coral / station receive","coral-l1":"Coral / L1 trough","coral-l2":"Coral / L2 branch","coral-l3":"Coral / L3 branch","coral-l4":"Coral / L4 branch","algae-floor":"Algae / floor pickup","algae-low":"Algae / low reef removal","algae-high":"Algae / high reef removal",processor:"Algae / processor delivery",net:"Algae / net",climb:"Cage / engagement study",park:"Barge / park intent"};function Er(i){let e=Es.find(n=>n.id===i);if(!e)throw new Error(`Unknown robot ${i}`);let t=e.capabilities;return["stow",...t.coralSources.map(n=>`coral-${n}`),...t.coralLevels.map(n=>`coral-l${n}`),...t.algaeSources.map(n=>({floor:"algae-floor",reefLow:"algae-low",reefHigh:"algae-high"})[n]),...t.algaeDestinations,t.climb==="park"?"park":"climb"]}function Kd(i,e){if(!Er(i).includes(e))throw new Error(`${i} does not support ${e}`)}var ui=i=>i*Math.PI/180,Tr=i=>i*180/Math.PI,wt=i=>new T(...i),jd=xt.pieces.coral.lengthMm/2,Vi=xt.pieces.algae.diameterMm/2,Bo=["approach","engage","release"],Qd={approach:"Align / approach",engage:"Engage / deliver",release:"Release / withdraw"},Sc={R01:{coral:{type:"lift",base:[-130,310,160],reach:500,maxHeight:2250},algae:{type:"twoLink",base:[160,430,300],upper:730,lower:630},pickup:!0,climb:"deep"},R02:{coral:{type:"lift",base:[0,440,160],reach:610,maxReach:740,maxHeight:2750},algae:{type:"shared"},climb:"shallow"},R03:{coral:{type:"lift",base:[-160,310,160],reach:480,maxHeight:2250},algae:{type:"twoLink",base:[180,430,300],upper:730,lower:630},shooter:!0,climb:"deep"},R04:{coral:{type:"telescope",base:[0,380,430],minLength:550,maxLength:2300},algae:{type:"shared"},climb:"deep"},R05:{coral:{type:"lift",base:[-120,310,160],reach:530,maxHeight:2250},algae:{type:"twoLink",base:[170,430,300],upper:540,lower:520},pickup:!0,climb:"shallow"},R06:{coral:{type:"telescope",base:[0,380,430],minLength:550,maxLength:2500,turret:!0},algae:{type:"shared"},climb:"park"},R07:{coral:{type:"lift",base:[-130,310,160],reach:500,maxHeight:1480},algae:{type:"telescope",base:[165,430,300],minLength:500,maxLength:1550},pickup:!0,climb:"deep"},R08:{coral:{type:"fixedArm",base:[-130,320,360],length:680},algae:{type:"twoLink",base:[170,430,300],upper:540,lower:520},pickup:!0,climb:"shallow"},R09:{coral:{type:"twoLink",base:[-140,480,360],upper:720,lower:630,rear:!0},algae:{type:"lift",base:[80,360,160],reach:590,maxHeight:1680},shooter:!0,climb:"deep"},R10:{coral:{type:"lift",base:[-180,350,160],reach:370,maxHeight:2250,side:!0},algae:{type:"lift",base:[180,360,160],reach:590,maxHeight:2800},climb:"shallow"}};function Ec(i,e="engage"){if(!Bo.includes(e))throw new Error(`Unknown phase ${e}`);let t={task:i,fieldFixed:!0,axis:[0,1,0],assumptions:[],part:"coral",release:!1};if(/^coral-l[234]$/.test(i)){let n=i.slice(-2),r=xt.interfaces[n],s=ui(r.upAngleDeg),a=[0,Math.cos(s),Math.sin(s)],o=[0,-r.tipInsetFromBaseMm,r.tipHeightMm-r.branchRadiusMm*Math.cos(s)],l=n==="l4"?120:140,c=wt(o).addScaledVector(wt(a),jd-l).toArray(),h=e==="approach"?wt(o).addScaledVector(wt(a),jd+70).toArray():c;return{...t,field:"reef",level:n,axis:a,center:h,goal:c,tip:o,branchBase:wt(o).addScaledVector(wt(a),-r.branchLengthHypothesisMm).toArray(),branchRadius:r.branchRadiusMm,insertionMm:e==="approach"?-70:l,release:e==="release",assumptions:["Branch exposed length and support profile are fixed hypotheses; highest points, pipe OD and angle are sourced.","Coral bore is nominal; cap shape, tolerance and retained-tool clearance are not qualified."]}}if(i==="coral-l1"){let n=xt.interfaces.l1.frontEdgeMm,r=[0,-85,n+57.15];return{...t,field:"trough",center:e==="approach"?[0,75,n+137.15]:r,goal:r,release:e==="release",assumptions:["Illustrative horizontal trough support at the sourced front-edge height; complete trough profile is not verified."]}}if(i==="coral-station"){let n=xt.interfaces.station,r=[1,0,0],s=[0,Math.cos(ui(55)),-Math.sin(ui(55))],a=[0,0,n.bottomMm+57.15/Math.cos(ui(55))],o=wt(a).addScaledVector(wt(s),e==="release"?160:e==="approach"?-60:0).toArray();return{...t,field:"station",axis:r,feedAxis:s,openingPoint:a,center:o,goal:o,assumptions:["Crosswise coral rolls down the sourced 55-degree chute; translation direction is not its cylinder axis.","Guide and receiving contact arrangement are proposed, not a reliable feed test."]}}if(i==="coral-floor")return{...t,field:"floor",axis:[1,0,0],center:[0,e==="release"?80:0,e==="release"?210:57.15],goal:[0,0,57.15],assumptions:["Loose crosswise coral on ideal carpet; not the initial stacked algae/coral condition."]};if(t.part="algae",t.axis=[0,1,0],i==="algae-floor")return{...t,field:"floor",center:[0,e==="release"?160:0,e==="release"?480:Vi],goal:[0,0,Vi],assumptions:["Ideal spherical algae and flat carpet; deformation is not modeled."]};if(i==="algae-low"||i==="algae-high"){let n=xt.interfaces[i==="algae-low"?"algaeLow":"algaeHigh"];return{...t,field:"reef-algae",center:[0,e==="release"?350:0,n.centerHypothesisMm],goal:[0,0,n.centerHypothesisMm],assumptions:[`Reef algae center ${n.centerHypothesisMm} mm is an explicit fixed hypothesis, not a sourced field datum.`]}}if(i==="processor"){let n=xt.interfaces.processor,r=[0,e==="approach"?320:e==="release"?-300:0,n.centerMm];return{...t,field:"processor",center:r,goal:[0,0,n.centerMm],release:e==="release",assumptions:["Centered ball passes within the sourced bounding aperture; rounded-corner, lip and compression details are unqualified."]}}if(i==="net"){let n=xt.interfaces.net,r=[0,e==="approach"?300:-400,n.rimHypothesisMm+Vi+60];return{...t,field:"net",center:r,goal:[0,-400,n.rimHypothesisMm+Vi+60],release:e==="release",assumptions:[`Net side-entry height ${n.rimHypothesisMm} mm and 1000 x 3500 mm clear aperture are hypotheses; end panels are higher.`,"No real launch calibration, drag, spin or release reliability is established."]}}throw new Error(`No interaction target for ${i}`)}function Tc(i){return i.side?{out:[-1,0,0],heading:Math.PI/2,edge:350}:{out:[0,i.rear?1:-1,0],heading:i.rear?Math.PI:0,edge:i.rear?760:0}}function As(i,e){let t=Tc(i),n=wt(i.base),r=wt(t.out),s=i.reach??610,a=[],o=[n.toArray()],l=!0,c="";if(i.type==="lift"){l=e>=180&&e<=i.maxHeight,l||(c=`Carriage target ${e.toFixed(1)} mm is outside 180..${i.maxHeight} mm.`);let p=Ct.clamp(e,180,i.maxHeight);o.push([n.x,n.y,p]),a.push({name:"Carriage height",value:p,unit:"mm"},{name:"Wrist support reach",value:s,unit:"mm"});let E=new T(n.x,n.y,p).addScaledVector(r,s);return o.push(E.toArray()),{...t,points:o,pivot:E.toArray(),joints:a,reachable:l,reason:c}}let h=e-n.z;if(i.type==="telescope"){let p=Math.min(i.spanLimit??1/0,h>700?Math.max(530,Math.abs(h)/Math.tan(ui(63))):610),E=Math.hypot(p,h),w=Ct.clamp(E,i.minLength,i.maxLength);l=Math.abs(h)<=w,l||(c=`Required vertical rise ${h.toFixed(1)} mm exceeds the ${i.maxLength} mm telescope.`),s=Math.sqrt(Math.max(0,w*w-Math.min(Math.abs(h),w)**2));let v=n.clone().addScaledVector(r,s);return v.z=n.z+Ct.clamp(h,-w,w),o.push(v.toArray()),a.push({name:"Boom length",value:w,unit:"mm"},{name:"Shoulder pitch",value:Tr(Math.atan2(v.z-n.z,s)),unit:"deg"}),{...t,points:o,pivot:v.toArray(),joints:a,reachable:l,reason:c}}if(i.type==="fixedArm"){l=Math.abs(h)<=i.length,l||(c=`Required rise ${h.toFixed(1)} mm exceeds fixed ${i.length} mm arm.`),s=Math.sqrt(Math.max(0,i.length**2-Math.min(Math.abs(h),i.length)**2));let p=n.clone().addScaledVector(r,s);return p.z=n.z+Ct.clamp(h,-i.length,i.length),o.push(p.toArray()),a.push({name:"Shoulder pitch",value:Tr(Math.atan2(p.z-n.z,s)),unit:"deg"},{name:"Fixed arm length",value:i.length,unit:"mm"}),{...t,points:o,pivot:p.toArray(),joints:a,reachable:l,reason:c}}s=Math.min(i.spanLimit??1/0,660,Math.sqrt(Math.max(0,(i.upper+i.lower-5)**2-h*h)));let d=Math.hypot(s,h);l=d<=i.upper+i.lower&&d>=Math.abs(i.upper-i.lower)&&s>0,l||(c="Requested height is outside the fixed two-link workspace.");let u=Ct.clamp(d,Math.abs(i.upper-i.lower)+.001,i.upper+i.lower-.001),f=Math.atan2(h,s)+Math.acos(Ct.clamp((i.upper**2+u**2-i.lower**2)/(2*i.upper*u),-1,1)),g=n.clone().addScaledVector(r,i.upper*Math.cos(f));g.z+=i.upper*Math.sin(f);let y=n.clone().addScaledVector(r,s);y.z=e,l||y.copy(g).addScaledVector(y.clone().sub(g).normalize(),i.lower),o.push(g.toArray(),y.toArray());let m=Math.atan2(y.z-g.z,y.clone().sub(g).dot(r));return a.push({name:"Shoulder pitch",value:Tr(f),unit:"deg"},{name:"Elbow relative",value:Tr(m-f),unit:"deg"},{name:"Upper / lower lengths",value:i.upper,second:i.lower,unit:"mm"}),{...t,points:o,pivot:y.toArray(),joints:a,reachable:l,reason:c}}function Wy(i,e,t,n=65){let s=ui(n),a=2*Math.cos(s)**2*(i*Math.tan(s)-(t-e));if(a<=0)throw new Error("Fixed-hood shot has no positive ballistic speed for this target");let o=Math.sqrt(9810*i**2/a),l=i/(o*Math.cos(s));return{speedMmPerSecond:o,flightSeconds:l,angleDeg:n,points:Array.from({length:41},(c,h)=>{let d=l*h/40;return[0,-o*Math.cos(s)*d,e+o*Math.sin(s)*d-9810*d*d/2]}),model:"Ideal point-mass projectile, no drag/spin"}}function Xy(i,e,t){let n=Tc(i),r=new Dt().setFromAxisAngle(new T(0,0,1),n.heading).invert(),s=e.part==="coral"?wt(e.axis):new T(0,1,0),a=new Dt().setFromUnitVectors(new T(0,1,0),s),o=e.part==="coral"?[[-96,96],[-90,198],[e.task==="coral-floor"?0:-112,128]]:[[-250,250],[118,312],[-240,240]],l=0;for(let c of o[0])for(let h of o[1])for(let d of o[2])l=Math.max(l,new T(c,h,d).applyQuaternion(a).sub(t).applyQuaternion(r).dot(wt(n.out)));return l}function zo(i,e,t="engage"){if(Kd(i,e),!Bo.includes(t))throw new Error("Unknown phase");let n=Sc[i];if(["stow","climb","park"].includes(e))return{id:i,task:e,phase:t,legacy:!0,pose:e==="park"?"climb":e,status:"POSE_ONLY_ENDGAME_NOT_SOLVED",reason:"Endgame/load engagement remains a separate unverified study.",joints:[],standOffMm:null};let r=Ec(e,t),s=r.part==="coral",a=s?"coral":"algae",o=s||n.algae.type==="shared"?n.coral:n.algae;if(e==="net"&&n.shooter){let le=[0,-xt.interfaces.net.openingWidthHypothesisMm/2,xt.interfaces.net.lowestMeshMm+Vi],de=1200,ge,De;for(;de<=2400;de+=25){ge=Wy(de-le[1],860,le[2],65);let Xe=de/(ge.speedMmPerSecond*Math.cos(ui(65)));if(De=860+ge.speedMmPerSecond*Math.sin(ui(65))*Xe-9810*Xe**2/2-Vi-xt.interfaces.net.rimHypothesisMm,De>=20)break}let Ye=[0,de,860],Qe=ge.points.map(Xe=>[0,Ye[1]+Xe[1],Xe[2]]);return{id:i,task:e,phase:t,role:a,spec:o,target:r,shooter:!0,status:De>=20?"ASSUMED_IDEAL_SHOT":"SHOT_CLEARANCE_UNRESOLVED",reason:r.assumptions.join(" "),rootPosition:[-70,de+80,0],heading:0,standOffMm:de-5,standOffDatum:"front bumper to assumed net near-side boundary",joints:[{name:"Fixed hood angle",value:65,unit:"deg"},{name:"Ideal release speed",value:ge.speedMmPerSecond/1e3,unit:"m/s"},{name:"Flight time",value:ge.flightSeconds,unit:"s"},{name:"Ball / near rail clearance",value:De,unit:"mm"}],shot:{...ge,worldPath:Qe,nearRailClearanceMm:De,landing:le},pieceCenter:t==="release"?Qe.at(-1):Ye,pieceAxis:[0,1,0],positionErrorMm:0,reachable:De>=20}}let l=Tc(o),c=new Dt().setFromAxisAngle(new T(0,0,1),l.heading),h=wt(r.axis),d=s?h.clone().multiplyScalar(180):new T(0,270,0),u=wt(r.center),f=u.clone();r.release&&(f=e==="net"?wt(r.goal).add(new T(0,170,140)):u.clone().add(new T(0,170,75))),t==="approach"&&!/^coral-l/.test(e)&&f.add(new T(0,120,0));let g=f.clone().add(d),y;if(e==="coral-floor"&&n.pickup){let le=[0,-300,57.15+(t==="release"?152.85:0)],de=wt(le).add(d).toArray();y={...l,pivot:de,points:[[0,30,230],de],joints:[{name:"Pickup deployment",value:t==="release"?-38:0,unit:"deg"}],reachable:!0,reason:"Dedicated pickup contact section; transfer to scorer is outside this task."};let ge=[0,r.center[1]-le[1],0];return{id:i,task:e,phase:t,role:a,spec:{type:"pickup"},target:r,mechanism:y,rootPosition:ge,heading:0,standOffMm:ge[1]-85,standOffDatum:"front bumper to floor-piece center plane",pieceCenter:r.center,pieceAxis:r.axis,toolCenter:r.center,joints:y.joints,status:"GEOMETRIC_CONTACT_PROPOSAL",reachable:!0,positionErrorMm:0,reason:r.assumptions.join(" "),contactOffset:d.toArray(),localToolCenter:le}}let m=Xy(o,r,d),p=o.side?o.base[0]+350:o.rear?760-o.base[1]:o.base[1],E=p+457.2-m-8,w={...o,spanLimit:E};e==="net"&&o.maxReach&&(w.reach=Math.min(o.maxReach,E,o.base[1]+275)),y=As(w,g.z);let v=d.clone().applyQuaternion(c.clone().invert()),R=wt(y.pivot).sub(v),C=R.clone().applyQuaternion(c),L=[f.x-C.x,f.y-C.y,0],D=C.add(wt(L)),M=s?Tr(Math.atan2(h.z,Math.hypot(h.x,h.y))):0,b=o.side?435:o.rear?845:85,P=L[1]-b,O=[...y.joints,{name:s?"Coral axis / wrist pitch":"Algae wrist pitch",value:M,unit:"deg"},{name:"Robot heading",value:Tr(l.heading),unit:"deg"}],z=D.distanceTo(f),W=e==="net"&&t==="release"?[0,-400,xt.interfaces.net.lowestMeshMm+Vi]:r.center,V=wt(y.pivot).sub(wt(o.base)).dot(wt(l.out))-p+m,te=V<=457.2+1e-6;O.push({name:"Tool forward extension envelope",value:V,unit:"mm"});let G=y.reachable?te?P<0?"CHASSIS_TARGET_OVERLAP":r.assumptions.length?"ALIGNED_UNDER_STATED_ASSUMPTIONS":"ALIGNED_GEOMETRICALLY":"ACTIVE_TOOL_EXTENSION_EXCEEDED":"UNREACHABLE_WITH_CURRENT_LIMITS";return{id:i,task:e,phase:t,role:a,spec:w,target:r,mechanism:y,rootPosition:L,heading:l.heading,standOffMm:P,standOffDatum:`${o.side?"left":o.rear?"rear":"front"} bumper to fixed ${r.field} reference plane`,pieceCenter:W,pieceAxis:r.axis,toolCenter:D.toArray(),localToolCenter:R.toArray(),joints:O,reachable:y.reachable&&P>=0&&te,positionErrorMm:z,workingExtensionMm:V,status:G,reason:[y.reason,...r.assumptions,te?"":"Active tool envelope exceeds the 457.2 mm rule limit; this is an unresolved configuration.",P<0?"The fixed-length recipe overlaps the target face; this capability needs redesign, not a forced fit.":"","The forward-tool check is not a whole-robot swept-envelope or collision pass."].filter(Boolean).join(" ")}}var Nt={support:12239555,contact:8361628,panel:14015450,wire:9017237,floor:14935521,dimension:6846327},qy=i=>new T(...i);function Ho(i,e,t,n=Nt.wire,r=!1){let s=new Et().setFromPoints(t.map(qy)),a=new wn({color:n}),o=r?new Ci(s,a):new Dn(s,a);return o.name=e,i.add(o),o}function eu(i,e,t){let n=xt.interfaces[e.level];for(let[r,s]of t.entries()){let a=[e.tip[0]+s,...e.tip.slice(1)],o=[e.branchBase[0]+s,...e.branchBase.slice(1)],l=Ve(i,`${e.level.toUpperCase()} branch ${r+1}`,o,a,e.branchRadius,Nt.contact);l.userData={role:"branch",level:e.level,tip:a,branchBase:o,radiusMm:e.branchRadius,highestPointMm:n.tipHeightMm};let c=e.level==="l4"?[o[0],o[1]-220,o[2]-220]:o,h=Ve(i,`${e.level.toUpperCase()} support ${r+1}`,[c[0],c[1],0],c,e.branchRadius,Nt.support);if(h.userData={role:"fieldSupport",profileAssumed:!0},e.level==="l4"){let d=Ve(i,`L4 assumed support bend ${r+1}`,c,o,e.branchRadius,Nt.support);d.userData={role:"fieldSupport",profileAssumed:!0}}}i.userData.branchLevel=e.level,i.userData.pairSpacingMm=n.pairSpacingMm,i.userData.caveats.push("Exposed branch length, support path and cap/weld shape are illustrative hypotheses, not reconstructed native CAD.")}function nu(i,e,t,n,r){let o=n+r,l=[Ke(i,`${e} bottom sill`,[0,-20/2,n-24/2],[t+48,20,24],Nt.contact),Ke(i,`${e} top lintel`,[0,-20/2,o+24/2],[t+48,20,24],Nt.support),...[-1,1].map(c=>Ke(i,`${e} ${c<0?"left":"right"} jamb`,[c*(t+24)/2,-20/2,(n+o)/2],[24,20,r],Nt.support))];for(let c of l)c.userData={role:"apertureFrame"};i.userData.opening={planeY:0,widthMm:t,heightMm:r,bottomMm:n,topMm:o}}function Yy(i){let e=xt.interfaces.l1,t=e.troughWidthHypothesisMm,n=e.troughDepthHypothesisMm,r=Ke(i,"L1 horizontal contact floor",[0,-n/2,e.frontEdgeMm-8],[t,n,16],Nt.panel);r.userData={role:"troughContact",surfaceHeightMm:e.frontEdgeMm};let s=Ke(i,"L1 front contact edge",[0,-6,e.frontEdgeMm-20],[t,12,40],Nt.contact);s.userData={role:"troughEdge",surfaceHeightMm:e.frontEdgeMm};for(let a of[-t/2+30,t/2-30])Ke(i,"Trough support",[a,-n+20,(e.frontEdgeMm-16)/2],[24,24,e.frontEdgeMm-16],Nt.support).userData={role:"fieldSupport"};i.userData.assumedDimensions={widthMm:t,depthMm:n},i.userData.caveats.push("Only the 457.2 mm front-edge datum is sourced; the horizontal floor, 900 mm width and 200 mm depth are assumed.")}function $y(i){let e=xt.interfaces.station,t=Ct.degToRad(e.chuteAngleDeg),n=new T(0,Math.cos(t),-Math.sin(t)),r=new T(0,Math.sin(t),Math.cos(t)),s=xt.pieces.coral.outsideDiameterMm/2,a=new T(0,0,e.bottomMm+s/Math.cos(t));nu(i,"Station",e.openingWidthMm,e.bottomMm,e.openingHeightMm);let o=10,l=400,c=220,h=a.clone().addScaledVector(n,s*Math.tan(t)).addScaledVector(r,-s-o/2),d=h.clone().addScaledVector(n,-l),u=qe(i,"Station sloped feed lane",d.toArray(),h.toArray(),c,o,Nt.panel);u.userData={role:"chuteContact",axis:n.toArray(),openingPoint:a.toArray(),normal:r.toArray(),contactOffsetMm:s,assumedLengthMm:l,assumedWidthMm:c},Ho(i,"Station feed centerline",[-220,120].map(g=>a.clone().addScaledVector(n,g).toArray()),Nt.contact).userData={role:"feedAxis",decorative:!0};let f=2*s;i.userData.feed={axis:n.toArray(),pieceAxis:[1,0,0],openingPoint:a.toArray(),sectionHeightMm:f,verticalClearanceMm:e.openingHeightMm-f,fullBoreClearance:!1},i.userData.caveats.push("Guide length, lane width and receiving arrangement are assumed. Crosswise coral translates down the 55-degree chute; the feed direction is not the cylinder axis. Nominal aperture clearance is not a feed reliability proof.")}function tu(i,e,t,n){let r=Ke(i,e,t,n,Nt.panel);return r.material=r.material.clone(),r.material.transparent=!0,r.material.opacity=.13,r.material.depthWrite=!1,r.castShadow=!1,r.userData={role:"netPanel",profileAssumed:!0},r}function Zy(i){let e=xt.interfaces.net,t=e.openingLengthHypothesisMm/2,n=e.openingWidthHypothesisMm,r=e.rimHypothesisMm,s=e.lowestMeshMm,a=e.endPanelTopDrawingMm,o=12;i.userData.opening={nearY:0,farY:-n,minX:-t,maxX:t,rimMm:r,endPanelTopMm:a};for(let[c,h]of[["near",o],["far",-n-o]])Ve(i,`Net ${c} rim`,[-t,h,r-o],[t,h,r-o],o,Nt.contact).userData={role:"netRim",side:c},tu(i,`Net ${c} side`,[0,c==="near"?2:-n-2,(r+s)/2],[2*t,4,r-s]);for(let c of[-1,1]){let h=c*(t+12);tu(i,`Net end panel ${c}`,[c*(t+2),-n/2,(a+s)/2],[4,n,a-s]);for(let d of[o,-n-o])Ve(i,"Net end post",[h,d,s],[h,d,a],8,Nt.support).userData={role:"netEndFrame"};Ve(i,"Net high end rail",[h,-n,a-8],[h,0,a-8],8,Nt.support).userData={role:"netEndFrame"}}let l=(c,h)=>s+(r-s)*(1-(1-(c/t)**2)*(1-((h+n/2)/(n/2))**2));for(let c=0;c<=14;c++){let h=-t+2*t*c/14,d=Array.from({length:17},(u,f)=>{let g=-n+n*f/16;return[h,g,l(h,g)]});Ho(i,`Net transverse mesh wire ${c}`,d).userData={role:"netMesh",profileAssumed:!0}}for(let c=0;c<=8;c++){let h=-n+n*c/8,d=Array.from({length:29},(u,f)=>{let g=-t+2*t*f/28;return[g,h,l(g,h)]});Ho(i,`Net longitudinal mesh wire ${c}`,d).userData={role:"netMesh",profileAssumed:!0}}i.userData.caveats.push("The 2260 mm near-side rim, 1000 x 3500 mm opening and sag profile are fixed hypotheses. End-panel top and lowest mesh are separate datums. Wires are illustrative, not a contact or shot simulation.")}function Jy(i,e){let t=Math.cos(e.heading),n=Math.sin(e.heading),r=[-435,435].flatMap(u=>[-85,845].map(f=>[e.rootPosition[0]+u*t-f*n,e.rootPosition[1]+u*n+f*t])),s=Math.min(...r.map(u=>u[1])),a=Math.max(...r.filter(u=>Math.abs(u[1]-s)<.001).map(u=>u[0])),o=a+30,l=12,c={from:[o,0,l],to:[o,e.standOffMm,l],valueMm:e.standOffMm,datum:e.standOffDatum},h=new pt;h.name="Stand-off dimension",h.userData={role:"dimension",decorative:!0,excludeFromBounds:!0},i.add(h);let d=[c.from,c.to];for(let u of[0,e.standOffMm])d.push([a,u,l],[o+12,u,l],[o-4,u-4,l],[o+4,u+4,l]);return Ho(h,"Stand-off line and witnesses",d,Nt.dimension,!0),c}function iu(i){if(i.legacy||["stow","climb","park"].includes(i.task))return null;let e=new pt;e.name="Fixed task field";let t=new pt;t.name=`${i.task} interface`,t.userData={role:"taskInterface",source:"field-targets.json geometry standard; not native CAD",caveats:["Illustrative primitives do not establish contact, swept clearance, retention, field accuracy or scoring."]},e.add(t);let n=i.target;switch(n.field){case"reef":eu(t,n,[0,xt.interfaces[n.level].pairSpacingMm]);break;case"trough":Yy(t);break;case"station":$y(t);break;case"processor":{let r=xt.interfaces.processor;nu(t,"Processor",r.openingWidthMm,r.bottomMm,r.openingHeightMm),t.userData.deliveryAxis=[0,-1,0],t.userData.caveats.push("Four bars represent the bounding aperture only; rounded corners, lip, ramp and compression remain unqualified.");break}case"net":Zy(t);break;case"reef-algae":{let r=i.task==="algae-low",s=Ec(r?"coral-l2":"coral-l3"),a=xt.interfaces[r?"algaeLow":"algaeHigh"],o=xt.interfaces[s.level].pairSpacingMm/2;eu(t,s,[-o,o]),t.userData.algaeCenterHypothesisMm=[0,a.normalOffsetHypothesisMm,a.centerHypothesisMm],t.userData.caveats.push("The parent owns the only algae ball. Its fixed 900/1300 mm center hypotheses are not a seated branch-contact solution.");break}case"floor":Ke(t,"Local carpet patch",[0,100,-3],[900,700,6],Nt.floor).userData={role:"floorContact",surfaceHeightMm:0,profileAssumed:!0};break;default:throw new Error(`No fixed task field for ${i.task}`)}return e.userData={fieldFixed:!0,field:n.field,dimension:Jy(e,i),assumptions:n.assumptions,contactProven:!1},e}function Ar(i,e,t=[0,0,0]){let n=new pt;return n.name=e,n.position.set(...t),i.add(n),n}var fn=i=>new T(...i);function Ky(i,e,t){let n=Ar(i,"Task coral",e);n.quaternion.setFromUnitVectors(new T(0,1,0),fn(t)),n.userData={role:"gamePiece",part:"coral",lengthMm:301.625,diameterMm:114.3};let r=new Yn({color:15263193,side:$t,roughness:.8});for(let s of[57.15,50.8]){let a=new Mt(new Sn(s,s,301.625,32,1,!0),r);a.castShadow=!0,a.receiveShadow=!0,n.add(a)}for(let s of[-1,1]){let a=new Mt(new qn(50.8,57.15,32),r);a.rotation.x=Math.PI/2,a.position.y=s*301.625/2,n.add(a)}return n}function jy(i,e,t,n=!1,r=!1){let s=Ar(i,"Active coral contact tool",e);s.quaternion.setFromUnitVectors(new T(0,1,0),fn(t)),s.userData={role:"contactTool",axis:[0,1,0],mount:[0,180,0],open:n};for(let a of[-92,92])Jt(s,"Coral cheek plate",a,[[-90,r?0:-110],[195,r?0:-110],[195,125],[120,125],[105,90],[-90,90]],7,ne.plate);for(let a of[-55,65])Tt(s,"Coral opposing roller",[0,a,82.15+(n?55:0)],170,25,ne.coral,!0),r||Tt(s,"Coral support roller",[0,a,-82.15-(n?35:0)],170,25,ne.coral,!0);return Ve(s,"Contact tool mounting pin",[-110,180,0],[110,180,0],14),s}function Qy(i,e,t,n=!1,r=!1){let s=Ar(i,"Active algae contact tool",e);s.quaternion.setFromUnitVectors(new T(0,1,0),fn(t)),s.userData={role:"contactTool",mount:[0,270,0],open:n};for(let o of[-245,245])Jt(s,"Algae roller support",o,[[125,r?-175:-235],[260,r?-175:-235],[290,-40],[290,65],[260,235],[125,235]],8,ne.algae);let a=Math.sqrt(246.375**2-160**2);for(let o of r?[1]:[-1,1])Tt(s,"Opposed algae capture roller",[0,160,o*(a+(n?85:0))],470,40,ne.algae,!0);return Tt(s,"Algae backing contact",[0,246.375,0],330,40,ne.rail),Ve(s,"Algae wrist mounting pin",[-100,270,0],[100,270,0],18),s}function Vo(i,e,t,n){let r=n==="coral"?ne.rail:ne.algae,s=Ar(i,`${n} ${e.type}`);if(s.userData={role:"manipulator",type:e.type,points:t.points},e.type==="pickup"){let o=t.points[0],l=t.points.at(-1);for(let c of[-205,205])qe(s,"Pickup side link",[c,o[1],o[2]],[c,l[1]-160,l[2]+45],20,45,ne.plate);return Ve(s,"Pickup pivot",[-240,o[1],o[2]],[240,o[1],o[2]],18),Tt(s,"Floor pickup drive",[0,l[1]-200,l[2]+95],420,45,ne.coral,!0),s}if(e.type==="lift"){let[o,l,c]=e.base,h=t.points[1][2],d=Math.max(0,h-850)/2;for(let g=0;g<3;g++){let y=135-g*25,m=c+g*d;for(let p of[-1,1])qe(s,"Nested lift rail",[o+p*y,l+g*23,m],[o+p*y,l+g*23,m+760],25,30,r);for(let p of[m+15,m+745])qe(s,"Stage crossbar",[o-y,l+g*23,p],[o+y,l+g*23,p],20,25,r)}let u=t.points[1],f=t.pivot;for(let g of[-70,70])qe(s,"Wrist support member",[u[0]+g,u[1],u[2]],[f[0]+g,f[1],f[2]],20,40,ne.plate);Ve(s,"Lift drive shaft",[o-140,l,205],[o+140,l,205],25)}else if(e.type==="telescope"){let o=fn(t.points[0]),l=fn(t.pivot),c=o.distanceTo(l),h=l.clone().sub(o).normalize();for(let d=0;d<3;d++){let u=d*c/3,f=Math.min(c,(d+1)*c/3+85);qe(s,"Three-stage telescopic boom",o.clone().addScaledVector(h,u).toArray(),o.clone().addScaledVector(h,f).toArray(),85-d*20,100-d*20,r)}}else for(let o=1;o<t.points.length;o++)for(let l of[-50,50]){let c=t.points[o-1],h=t.points[o];qe(s,`Fixed arm segment ${o}`,[c[0]+l,c[1],c[2]],[h[0]+l,h[1],h[2]],22,50,r)}let a=t.points[0];for(let o of[-85,85])qe(s,"Chassis anchored support",[a[0]+o,a[1],155],[a[0]+o,a[1],Math.max(160,a[2])],30,40,ne.rail);for(let o of t.points)Ve(s,"Mechanism pivot shaft",[o[0]-105,o[1],o[2]],[o[0]+105,o[1],o[2]],18);return s}function ru(i,e,t){let n=t==="coral"?"algae":"coral",r=e[n];if(r.type==="shared"||t==="algae"&&e.algae.type==="shared")return;let s=As(r,n==="coral"?700:650);Vo(i,r,s,n),Ke(i,`${n} inactive folded tool`,s.pivot,[160,110,80],n==="coral"?ne.coral:ne.algae)}function e_(i,e){if(e!=="park"){for(let t of[-100,100])qe(i,"Parked climb arm",[t,670,175],[t,630,790],30,40,ne.climb),Jt(i,"Parked cage hook",t,[[600,750],[710,750],[725,840],[680,860],[675,825],[690,810],[680,780],[600,780]],16,ne.climb);Ve(i,"Climb winch",[-105,640,230],[105,640,230],30)}}function Ac(i,e,t,n){let r=new Dn(new Et().setFromPoints(t.map(fn)),new wn({color:n}));return r.name=e,i.add(r),r}function su(i,e,t="engage"){let n=zo(i,e,t),r=Sc[i];if(n.legacy){let l=Gd(i,n.pose),c=qd(l,xc.find(h=>h.id===i),n.pose);return{model:l,field:c,solution:n}}let s=Ar(new pt,`${i} ${e} interaction`),a=Ar(s,"Positioned robot",n.rootPosition);if(a.rotation.z=n.heading,a.userData={role:"robot",baseZ:0},Mc(a),e_(a,r.climb),r.shooter&&!n.shooter&&wc(a,70),n.shooter){ru(a,r,"algae");let l=As(r.algae,700);Vo(a,r.algae,l,"algae");let c=fn(n.shot.worldPath[0]).sub(fn(n.rootPosition)),h=Ct.degToRad(65);for(let[u,f]of[[90,1],[40,-1]]){let g=c.clone().add(new T(0,Math.sin(h),Math.cos(h)).multiplyScalar(f*(206.375+u)));Tt(a,"Fixed-angle launch contact",g.toArray(),460,u,ne.coral,!0);for(let y of[-250,250])qe(a,"Shooter support",[c.x+y,250,160],[c.x+y,g.y,g.z],25,35,ne.rail)}Ac(s,"Calculated ideal launch arc",n.shot.worldPath,ne.algae);let d=n.pieceCenter;on(s,"Single task algae",new En(206.375,32,20),ne.ball,d).userData={role:"gamePiece",part:"algae"}}else{ru(a,r,n.role),Vo(a,n.spec,n.mechanism,n.role),n.spec.type==="pickup"&&Vo(a,r.coral,As(r.coral,700),"coral");let c=new Dt().setFromAxisAngle(new T(0,0,1),n.heading).clone().invert(),h=fn(n.role==="coral"?n.pieceAxis:[0,1,0]).applyQuaternion(c).toArray(),d=n.role==="coral"?jy(a,n.localToolCenter,h,n.target.release,e==="coral-floor"):Qy(a,n.localToolCenter,h,n.target.release,e==="algae-floor");a.updateWorldMatrix(!0,!0);let u=d.getWorldPosition(new T),f=d.localToWorld(fn(d.userData.mount)),g=a.localToWorld(fn(n.mechanism.pivot));n.meshToolPositionErrorMm=u.distanceTo(fn(n.toolCenter??n.pieceCenter)),n.meshMountErrorMm=f.distanceTo(g),n.role==="coral"?Ky(s,n.pieceCenter,n.pieceAxis):on(s,"Single task algae",new En(206.375,32,20),ne.ball,n.pieceCenter).userData={role:"gamePiece",part:"algae"},e==="processor"&&Ac(s,"Processor delivery line",[[0,330,431.8],[0,-350,431.8]],ne.algae),e==="net"&&Ac(s,"Placement then gravity release",[n.target.goal,[0,-400,2136.775]],ne.algae)}s.userData={task:e,phase:t,status:n.status,geometricTargetsOnly:!0};let o=iu(n);return{model:s,field:o,solution:n}}function Cc(i,e){let t=new Yt().setFromObject(i);return e?.visible&&t.union(new Yt().setFromObject(e)),t}At.DEFAULT_UP.set(0,0,1);var Rc=document.querySelector("#scene"),ht=new Lo({antialias:!0,preserveDrawingBuffer:!0});ht.setPixelRatio(Math.min(devicePixelRatio,2));ht.setClearColor(15922675);ht.outputColorSpace=Vt;ht.toneMapping=Va;ht.toneMappingExposure=1.25;ht.shadowMap.enabled=!0;ht.shadowMap.type=Na;Rc.appendChild(ht.domElement);ht.domElement.setAttribute("aria-label","Robot task interaction scene");var An=new Qr,Ut=new kt(33,1,10,25e3);Ut.up.set(0,0,1);var Cr=new No(Ut,ht.domElement);Cr.enableDamping=!0;Cr.minDistance=150;An.add(new ms(16777215,7438716,2.4));var Pr=new fr(16777215,3.2);Pr.position.set(-1600,2600,4500);Pr.castShadow=!0;Pr.shadow.mapSize.set(2048,2048);Object.assign(Pr.shadow.camera,{left:-3e3,right:3e3,top:3200,bottom:-2800,near:100,far:1e4});Pr.shadow.bias=-15e-5;An.add(Pr);var lu=new fr(14543087,1.5);lu.position.set(2400,-1800,2200);An.add(lu);var Pc=new Mt(new Pi(2e4,2e4),new us({opacity:.12}));Pc.receiveShadow=!0;Pc.position.z=-2;An.add(Pc);var Wt,mn="R03",Xt="coral-l4",fi="engage",Lc="iso",Cs="whole",cu=0,ot=i=>document.getElementById(i),pi=i=>Number.isFinite(i)?i.toFixed(1):"Not solved";function au(i){i?.traverse(e=>e.geometry?.dispose()),i&&An.remove(i)}function Rr(){let i=Cc(Wt.model,Wt.field),e=i.getCenter(new T),t=i.getSize(new T).length()/2;Cs==="contact"&&!Wt.solution.legacy&&(e=new T(...Wt.solution.pieceCenter),t=Xt==="net"?900:460);let n={iso:[1.5,2.1,1.3],side:[1,0,.08],front:[0,1,.06],top:[0,.001,1]},r=new T(...n[Lc]).normalize(),s=Ct.degToRad(Ut.fov),a=2*Math.atan(Math.tan(s/2)*Ut.aspect),o=t/Math.sin(Math.min(s,a)/2)*1.1;Cr.maxDistance=Math.max(12e3,o*2),Ut.far=Math.max(25e3,o+t*4),Ut.updateProjectionMatrix(),Ut.position.copy(e).addScaledVector(r,o),Cr.target.copy(e),Ut.lookAt(e),Cr.update(),ht.render(An,Ut)}function t_(){let i=ot("comparison");i.replaceChildren();for(let e of Es){let t=Er(e.id).includes(Xt),n=document.createElement("tr"),r=document.createElement("button");r.type="button",r.className="robot-link",r.textContent=`${e.id} ${e.title}`,r.disabled=!t,r.addEventListener("click",()=>Lr(e.id,Xt,fi));let s=document.createElement("td");s.append(r),n.append(s);let a=t?zo(e.id,Xt,fi):null,o=t?[a.status,pi(a.standOffMm),a.joints.map(l=>`${l.name}: ${pi(l.value)}${l.second?` / ${pi(l.second)}`:""} ${l.unit}`).join("; ")]:["Not a declared capability","-","-"];for(let l of o){let c=document.createElement("td");c.textContent=l,n.append(c)}e.id===mn&&(n.className="selected"),i.append(n)}}function n_(){let i=Es.find(t=>t.id===mn),e=Wt.solution;ot("robot-title").textContent=`${mn} / ${i.title}`,ot("task-title").textContent=Ts[Xt],ot("status").textContent=e.status.replaceAll("_"," "),ot("status").classList.toggle("blocked",!e.reachable&&!e.legacy),ot("gap").textContent=Number.isFinite(e.standOffMm)?`${pi(e.standOffMm)} mm`:"Not solved",ot("gap-datum").textContent=e.standOffDatum||e.reason,ot("piece-height").textContent=e.pieceCenter?`${pi(e.pieceCenter[2])} mm`:"-",ot("error").textContent=e.positionErrorMm===void 0?"-":`${e.positionErrorMm.toFixed(3)} mm`,ot("assumptions").textContent=e.reason||"Static configuration only.",ot("joints").replaceChildren();for(let t of e.joints){let n=document.createElement("dt");n.textContent=t.name;let r=document.createElement("dd");r.textContent=`${pi(t.value)}${t.second?` / ${pi(t.second)}`:""} ${t.unit}`,ot("joints").append(n,r)}ot("contact-rule").textContent=e.target?.insertionMm!==void 0?`Branch insertion: ${pi(e.target.insertionMm)} mm; bore coaxial to the branch.`:e.shooter?"Ideal projectile at the stated release angle/speed; not a calibrated shot.":Xt==="processor"?"One ball passes the sourced opening center; tool release is separate.":e.legacy?e.reason:"The task target, piece pose and tool datum share one coordinate calculation.",ot("phase").disabled=e.legacy,ot("png").href=`interactions/task-${mn}-${Xt}.png`,ot("png").textContent="Engagement PNG",ot("comparison-title").textContent=`Same task / ${Ts[Xt]} / ${Qd[fi]}`,document.title=`${mn} / ${Ts[Xt]} / Robot interactions`,t_()}function Lr(i,e=Xt,t=fi){let n=Er(i);if(n.includes(e)||(e=n.includes("coral-l4")?"coral-l4":n.find(r=>r.startsWith("coral-l"))||"stow"),!Bo.includes(t))throw new Error("Unknown phase");return mn=i,Xt=e,fi=t,au(Wt?.model),au(Wt?.field),Wt=su(mn,Xt,fi),An.add(Wt.model),Wt.field&&An.add(Wt.field),ot("robot").value=mn,ot("task").replaceChildren(...n.map(r=>{let s=document.createElement("option");return s.value=r,s.textContent=Ts[r],s})),ot("task").value=Xt,ot("phase").value=fi,n_(),Rr(),hu()}function hu(){let i=Cc(Wt.model,Wt.field);Ut.updateMatrixWorld();let e=[];for(let t of[i.min.x,i.max.x])for(let n of[i.min.y,i.max.y])for(let r of[i.min.z,i.max.z])e.push(new T(t,n,r).project(Ut));return{id:mn,task:Xt,phase:fi,focus:Cs,view:Lc,frames:cu,framed:Cs==="contact"?null:e.every(t=>Math.abs(t.x)<=1&&Math.abs(t.y)<=1&&t.z>=-1&&t.z<=1),solution:Wt.solution,size:[ht.domElement.width,ht.domElement.height],tasks:Er(mn)}}function i_(){return ht.render(An,Ut),ht.domElement.toDataURL("image/png")}function r_(){ht.render(An,Ut);let i=ht.getContext(),e=new Uint8Array(ht.domElement.width*ht.domElement.height*4);i.readPixels(0,0,ht.domElement.width,ht.domElement.height,i.RGBA,i.UNSIGNED_BYTE,e);let t=0,n=0;for(let r=0;r<e.length;r+=4){let s=e[r],a=e[r+1],o=e[r+2];Math.max(s,a,o)-Math.min(s,a,o)>25&&t++,Math.max(s,a,o)<155&&n++}return{colored:t,dark:n,total:e.length/4,nonblank:t>400&&n>100}}function Ic(){let i=Rc.getBoundingClientRect();ht.setSize(i.width,i.height),Ut.aspect=i.width/i.height,Ut.updateProjectionMatrix(),Wt&&Rr()}new ResizeObserver(Ic).observe(Rc);ot("robot").addEventListener("change",i=>Lr(i.target.value));ot("task").addEventListener("change",i=>Lr(mn,i.target.value));ot("phase").addEventListener("change",i=>Lr(mn,Xt,i.target.value));ot("view").addEventListener("change",i=>{Lc=i.target.value,Rr()});ot("focus").addEventListener("change",i=>{Cs=i.target.value,Rr()});window.interactionViewer={choose:Lr,diagnostics:hu,capture:i_,pixels:r_,refreshLayout:Ic,setFocus:i=>{Cs=i,ot("focus").value=i,Rr()},exportSize:(i,e)=>{ht.setPixelRatio(1),ht.setSize(i,e,!1),Ut.aspect=i/e,Ut.updateProjectionMatrix(),Rr()}};Ic();var ou=new URL(location.href).searchParams;Lr(ou.get("robot")||"R03",ou.get("task")||"coral-l4","engage");ht.setAnimationLoop(()=>{cu++,Cr.update(),ht.render(An,Ut)});})();
