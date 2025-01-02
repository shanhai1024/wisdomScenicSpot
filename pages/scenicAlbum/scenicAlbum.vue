<template>
	<view class="content">
		<view class="item" v-for="(item, index) in data.data" :key="index">
			<view class="pagetitle">
				<view class="title-container">
					<text class="separator">|</text>
					<text class="title">{{ item.title }}</text>
				</view>

			</view>
			<view class="imageList">
				<view @click="showImage(idx,image.loopPicPath)" class="imageItem" v-for="(image, idx) in item.list"
					:key="idx" :style="{ backgroundImage: `url(http://59.46.190.164:7080${image.coverPath})` }">
					<view>
						<image class="albumIcon" src="../../static/index/icon/albumIcon.png"></image>
						<text class="title">{{image.title}}</text>
					</view>

				</view>
			</view>
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

	let data = ref();

	function getData() {
		uni.request({
			method: 'GET',
			url: 'http://59.46.190.164:7080/appScenic/appAlbum/list',
			token: uni.getStorageSync('token'),
			header: {

				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log("=====================")
			console.log(res)
			data.value = res.data

		})
	}

	function showImage(index, list) {
		console.log(index + "=========")
		console.log(list)
		// 使用 split 分割字符串为数组，然后使用 map 给每个元素添加前缀
		const result = list.split(",").map(item => "http://59.46.190.164:7080" + item);
		console.log("====-=-=-=-=-=-=-=-=-=-=-=-=-");
		console.log(result);
		console.log(result);


		uni.previewImage({
			current: result[index], // 当前图片的 URL
			urls: result // 所有图片的 URL 数组
		});

	}


	onLoad(() => {
		getData()

	})
</script>

<style lang="scss">
	.content {
		width: 90vw;
		height: 100vh;
		margin: 0 auto;

		.item {
			margin-top: 30px;
		}

		.pagetitle {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin: 20px 0;
			width: 100%;

			.title-container {
				display: flex;
				align-items: center;
			}

			.separator {
				font-size: 25px;
				margin-right: 5px;
				color: #ed7e49;
				font-weight: 1000;
			}

			.title {
				font-size: 20px;
				font-weight: bold;
			}


		}

		.imageList {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;

			.imageItem {
				background-color: #ed7e49;
				height: 15vh;
				background-size: cover;
				background-position: center;
				position: relative;

				.albumIcon {
					width: 20px;
					height: 20px;
				}

				view {
					font-size: 12px;
					position: absolute;
					display: flex;
					align-items: center;
					bottom: 0;
					color: #fff;
				}


			}
		}
	}
</style>