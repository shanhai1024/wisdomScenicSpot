<template>
	<view>
		<view class="pageBackImage">
			<image :src="`http://59.46.190.164:7080${data.data.cover}`"></image>

		</view>

		<view class="content">
			<text class="title">{{data.data.title}}</text>
			<view v-html="data.data.introduction"></view>

		</view>

	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from "@dcloudio/uni-app"
	let data = ref()

	function getData(id) {
		uni.request({
			method: 'GET',
			url: 'http://59.46.190.164:7080/appScenic/strategy/detail?id=' + id,
			token: uni.getStorageSync('token'),
			header: {

				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {

			data.value = res.data

		})
	}

	onLoad((infoData) => {
		console.log(infoData.id);
		getData(infoData.id)


	})
</script>



<style lang="scss">
	.pageBackImage {
		width: 100vw;

		image {
			width: 100%;
		}
	}

	.content {
		padding: 0 5vw;
		padding-top: 20px;
		border-radius: 15px;
		background-color: #fff;
		position: relative;
		/* 或 absolute/fixed，根据实际布局需求选择 */
		top: -5vh;
		height: 90vh;

		.title {
			font-size: 15px;
			font-weight: 700;
			margin-bottom: 10px;
		}
	}
</style>