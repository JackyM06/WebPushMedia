<template>
    <div class="d-flex flex-column jc-center ai-center">        
        <div class="d-flex flex-column jc-center ai-center mt-3">
          <h3>文件推流</h3>
           <input class="mb-2 p-1" v-model="pushUrl" type="text" style="width:300px" placeholder="请输入推流的RTMP地址">
          <input ref="file" type="file" accept="audio/*,video/*" class="fs-xxs my-2 text-center">
          <button v-show="!Uploading" @click="beginUpload">开始文件推流</button>
          <button v-show="Uploading" @click="endUploading">取消文件推流</button>
          <p class="fs-xxs my-2 text-center" v-text="message"></p>
        </div>
    </div>
</template>

<script>
    import io from 'socket.io-client'
    // import MediaStreamRecorder from 'msr'
    export default {
        props:{
          connectURL:{
            type:String,
            default:'http://localhost:8090'
          }
        },
        data () {
            return {
                Recording:false,
                blobUrl:"",
                mediaRecorder:null,
                pushUrl:null,
                socket:null,
                message:'选择音频或视频文件后，点击开始文件推流进行RTMP推流',
                canSend:false,
                Uploading:false,
                type:"audio",
                sendTimer:[],
            }
        },
        methods:{
            // ? websocket 方案 //
            // 获取连接 
            socketConnect(wsUrl,callback){
              this.socket = io.connect(wsUrl)
              this.socket.on('connected',()=>{
                this.socket.emit('start',this.pushUrl,this.type)
                this.message = "webscocket连接成功，正在提交推流地址"
              })
              this.socket.on('started',()=>{
                this.message = "推流地址提交成功，正在提交流文件"
                this.canSend = true
                callback()
              })
              this.socket.on('startError',msg =>{
                this.message = "操作异常请重试，错误信息:"+msg
                this.socketDisconnect()
              })
              this.socket.on('ended',()=>{
                this.message = '推流已结束'
                this.Uploading = false
                this.canSend = false
              })
            },
            // 断开连接
            socketDisconnect(){
              if(this.socket){
                this.socket.emit('end')
              }
            },
            socketFileSend(blob){
              if(this.canSend){
                this.socket.emit("sendFileBlob", blob)
              }else{
                this.message = "当前连接中断，请重试"
              }
              this.socket.on('sent',()=>{
                this.message = "正在推流中，可到采集结果中拉流查看效果"
              })
            },
            beginUpload(){
               let file = this.$refs.file.files[0]
               if(file){
                 let type = file.type
                this.type = type.slice(0,5)
                this.socketConnect(this.connectURL,this.beginUploading)
               }else{
                alert("请选择音/视频文件")
              }
            },
            beginUploading(){
              let file = this.$refs.file.files[0]
              let type = file.type
              let reader = new FileReader()
              reader.readAsArrayBuffer(file)
              reader.onload = (e)=>{
                let blob = null
                if (typeof e.target.result === 'object') {
                  blob = new Blob([e.target.result],{type})
                } else {
                  blob = e.target.result
                }
                this.Uploading = true
                this.sliceUpload(blob)
              }
            },
            // 文件分片上传
            sliceUpload(blob){
              const chunk = 1024*1024 //字节，一次上传1MB
              let length = Math.ceil(blob.size/chunk)
              for(let i=0;i<length;i++){
                this.sendTimer.push(
                  setTimeout(()=>{
                    let partBlob = blob.slice(i*chunk,(i+1)*chunk,blob.type)
                    this.socketFileSend(partBlob)
                  },i*3000) //默认3s发送一次数据包
                ) 
              }
            },
            endUploading(){
              this.sendTimer.map(e=>clearTimeout(e))
              this.socketDisconnect()
              Object.assign(this.$data, this.$options.data())
              this.initPushURL()
            },
            initPushURL(){
              if(localStorage.getItem('rtmp') == undefined || !localStorage.getItem('rtmp').includes('rtmp://')){
                let mockUrl = `rtmp://${window.location.hostname}:1935/live/root_`+parseInt(Math.random()*100000)
                this.pushUrl = mockUrl
              }else{
                this.pushUrl = localStorage.getItem('rtmp')
              }
            },
            setPushURL(val){
              localStorage.setItem('rtmp',val)
            }
        },
        beforeDestroy(){
          this.endUploading()
        },
        mounted(){
          this.initPushURL()
        },
        watch:{
          message(val){
            console.log(val)
          },
          pushUrl(val){
            this.setPushURL(val)
          }
        }
    }
</script>

<style lang="scss" scoped>

</style>