<template>
    <div class="h-100 d-flex flex-column jc-around ai-center">
        <div class="text-center container-main">
          <h1 class="mb-3">流媒体采集推流
            <span title="点击推流没反应？" class=" text-grey cursor-point" @click.stop="showInfo = true">
              <svg class="icon"  aria-hidden="true">
                <use xlink:href="#icon-wenhao"  ></use>
              </svg>
            </span>
          </h1>
          <button id="mainEl" class="mr-2" @click="selectMode(0,$event)" disabled>麦克风推流</button>
          <button class="mr-2" @click="selectMode(1,$event)">本地文件推流</button>
          <button class="mr-2" @click="selectMode(2,$event)">文件URL推流</button>
          <button class="mr-2" @click="selectMode(3,$event)">视频录制推流</button>
          <button @click="selectMode(4,$event)">屏幕录制推流</button>
        </div>

        <div class="d-flex flex-column ai-center" style="width:60%">
            <transition name="slide-fade">
              <audio-push v-if="currentSelect === 0" :connectURL="connectURL" ></audio-push>
              <file-push v-if="currentSelect === 1" :connectURL="connectURL" ></file-push>
              <file-url-push v-if="currentSelect === 2" :connectURL="connectURL" ></file-url-push>
              <video-push v-if="currentSelect === 3" :connectURL="connectURL" ></video-push>
              <screen-push v-if="currentSelect === 4" :connectURL="connectURL" ></screen-push>
            </transition>
        </div>

        <router-link tag="a" target="_blank" :to="routeInfo" >采集结果</router-link>
        <transition name="bounce">
            <introduct-card ref="showPanel" v-show="showInfo"></introduct-card>
        </transition>
    </div>
</template>

<script>
    import AudioPush from './AudioPush.vue'
    import FilePush from './FilePush.vue'
    import FileUrlPush from './FileUrlPush.vue'
    import VideoPush from './VideoPush.vue'
    import ScreenPush from './ScreenPush.vue'
    import IntroductCard from './IntroductCard.vue'
    export default {
      data () {
        return {
          currentSelect:0,
          element:null,
          showInfo:false,
          
        }
      },
      components:{
          AudioPush,
          VideoPush,
          FilePush,
          FileUrlPush,
          ScreenPush,
          IntroductCard
      },
      computed:{
        connectURL(){
          // 当前部署环境下的连接地址 socket.io
          // return 'http://localhost:8090'
          return `${window.location.protocol}//${window.location.hostname}:8090`
        },
        routeInfo(){
          return {
            path:"/pull",
            query:{
              pullUrl:localStorage.rtmp
            }
          }
        }
      },
      methods: {
        selectMode(index,event){
          if(this.element){this.element.removeAttribute('disabled')}
          this.currentSelect = index
          this.element = event.target
          this.element.setAttribute("disabled","disabled")
        },
        mediaError(){
          this.showInfo = true
        }
      },
      mounted(){
        this.element = document.getElementById("mainEl")
      },
      created(){
        document.addEventListener('click',(e)=>{
          let showPanel = this.$refs.showPanel.$el
          if(showPanel && showPanel.contains){
                let isSelf = showPanel.contains(e.target)
                if(!isSelf && this.showInfo == true){
                    this.showInfo = false
                }
              }
          })
      }
    }
</script>

<style lang="scss" scoped>
  .container-main button{
    margin-bottom: 5px;
  }
</style>