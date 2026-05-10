<template>
  <div style="padding-bottom: 60px">
    <router-view />
  </div>
  <nav style="position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-around;background:#fff;border-top:1px solid #eee;padding:8px 0">
    <router-link to="/">首页</router-link>
    <router-link to="/wardrobe">衣橱</router-link>
    <router-link to="/upload">拍照</router-link>
    <router-link to="/video">视频</router-link>
    <router-link to="/mix-match">搭配</router-link>
  </nav>
</template>
