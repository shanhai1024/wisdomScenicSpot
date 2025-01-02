<template>
	<view class="pageContent">

		<view class="content">
			<view class="pageTitle">
				<uni-icons type="back" size="30" color="#ccc"></uni-icons>
				<input class="searchInput" confirm-type="search" placeholder="搜索攻略" />
				<button class="searchButton" size="mini">搜索</button>
			</view>
			<scroll-view scroll-y>
				<view @click="gotoInfo(item.id)" class="item" v-for="item  in data.rows">
					<image :src="`http://59.46.190.164:7080${item.cover}`"></image>
					<text class="title">{{item.title}}</text>
					<text class="subtitle">{{item.subtitle}}</text>
				</view>


			</scroll-view>
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


	function getData() {
		uni.request({
			method: 'GET',
			url: 'http://59.46.190.164:7080/appScenic/strategy/list?title=',
			token: uni.getStorageSync('token'),
			header: {

				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log("=====================")
			console.log(res.data.rows)
			data.value = res.data

		})
	}

	function gotoInfo(id) {
		uni.navigateTo({
			url: "raidersInfo?id=" + id,

		})

	}
	onLoad(() => {
		getData()
	})
</script>

<style lang="scss">
	.pageContent {
		width: 100vw;
		height: 100vh;
		padding-top: 40px;

		.content {
			width: 90vw;
			height: 100vh;
			margin: 0 auto;

			scroll-view {
				width: 100%;
				height: 100%;
				// background-color: #ed7339;

				.item {
					// background-color: #ed7339;
					margin-top: 20px;
					display: flex;
					flex-direction: column;

					image {
						width: 100%;
						border-radius: 25px;
					}

					.title {
						font-weight: bold;
						margin: 5px 0;
						font-size: 20px
					}

					.subtitle {
						color: #b9b9b9;
					}
				}
			}


		}


		.pageTitle {
			align-items: center;
			display: flex;
			width: 100%;
			height: 5vh;

			.searchInput {
				border-radius: 25px;
				border: 1px solid #ed7339;
				height: 25px;
				padding-left: 20px;
				font-size: 15px;
				color: #ccc;
			}

			.searchButton {
				color: #fff;
				border-radius: 25px;
				border: 1px solid #ed7339;
				background-color: #ed7339;

			}
		}
	}
</style>