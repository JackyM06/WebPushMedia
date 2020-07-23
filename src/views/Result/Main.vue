<template>
<div class="box">
  <h1 class="mb-4">RTMP语音拉流</h1>
  
  <audio id="videoElement" autoplay  style="width: 60%;" class="my-2" controls="controls"></audio>
  <!-- <video id="videoElement" autoplay  style="width: 60%;" controls="controls"></video> -->

  <input type="text" class="inputStyle" v-model="urlCache" placeholder="请输入拉流地址，支持FLV">
  <p class="fs-xxs mb-2">仅支持flv格式,一般情况下在默认rtmp拉流地址后加上flv后缀即可。</p>
  <p class="fs-xxs mb-2" ref="pullState" v-text="pullState"></p>
  <button @click="flvInit">开始</button>
</div>
</template>

<script>
  import flvjs from 'flv.js'
  export default {
    data () {
      return {
        urlCache:'http://39.106.198.9:8000/live/home.flv',
        pullUrl:null,
        flvPlayer:null,
        pullState:"点击开始进行拉流"
      }
    },
    methods:{
      // 初始化flvPlayer
      flvInit(){
        this.flvDestory()
        this.pullUrl = this.urlCache
        if (flvjs.isSupported()) {
          var videoElement = document.getElementById('videoElement');
          this.flvPlayer = flvjs.createPlayer({
              type: 'flv',
              url:this.pullUrl, //本地
          });
          this.pullState = "当前拉流地址："+ this.pullUrl
          this.flvPlayer.attachMediaElement(videoElement);
          this.flvPlayer.load();
          this.flvPlayer.play();
          videoElement.addEventListener('ended',()=>{
            this.flvInit()
          })
        }
      },
      // 销毁flvPlayer
      flvDestory(){
        if(this.flvPlayer){
          this.flvPlayer.pause()
          this.flvPlayer.unload()
          this.flvPlayer.detachMediaElement()
          this.flvPlayer.destroy()
          this.flvPlayer = null
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
.box{
        height:100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }
      .inputStyle{
        width:300px;
        margin-bottom: 10px;
      }
</style>