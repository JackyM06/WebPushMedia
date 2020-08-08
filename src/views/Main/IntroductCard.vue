<template>
<div class="font-style intrCard card-s">
    <h2 class="p-0 m-0">当前站点未添加到浏览器白名单，无法调用多媒体设备</h2>
    <h3 class="p-0 m-0">请参看：HTTP站点中让chrome浏览器突破设备权限办法</h3>
    <ol>
        <li>在chrome地址栏中输入<strong>chrome://flags/#unsafely-treat-insecure-origin-as-secure</strong>并回车</li>
        <li>将<span class="bg-yellow font-weight" >Insecure origins treated as secure</span>下的<span class="text-blue">Disabled</span>
            按钮调为<span class="bg-blue-black text-white">Enabled</span>
        </li>
        <li>将当前地址<strong v-text="url"></strong>添加到按钮旁边的输入框中</li>
        <li>点击右下角的<span class="bg-blue text-white">Relaunch</span>自动重启即可</li>
    </ol>
</div>
</template>

<script>
    export default {
        data () {
            return {
                show:false,
                url:window.location.href
            }
        }
    }
</script>

<style lang="scss" scoped>
.font-style{
    display: inline-block;
    font-size: .8125rem;
    font-weight: 500;
    line-height: 1.5;
    margin: 0;
    padding: 0;
}
.intrCard{
    background: white;
    padding: 30px 20px;
    position: fixed;
    bottom: 30px;
    right: 40px;
}
</style>