scrcpy<template>
	<view class="page">

		<scroll-view scroll-y class="content">
			<view class="item" v-for="item in response">
				<image mode="aspectFill" :src="`http://59.46.190.164:7080${item.cover}`"></image>
				<view class="itemContent">
					<text class="title">{{item.title}}</text>
					<text class="describe">{{item.describe}}</text>
					<view class="dictLabelDiv">
						<text class="dictLabel" v-for="limitList in item.limitList">{{limitList.dictLabel}}</text>

					</view>
				</view>
			</view>


		</scroll-view>



	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLaunch,
		onShow,
		onHide,
		onLoad
	} from '@dcloudio/uni-app'
	let response = ref()


	onLoad(() => {
		uni.request({
			method: 'GET',
			url: 'http://59.46.190.164:7080/appScenic/activity/list',
			token: uni.getStorageSync('token'),
			header: {

				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log(res.data.rows)
			response.value = res.data.rows

		})
	});
</script>

<style lang="scss">
	.page {
		width: 100vw;
		height: 100vh;

		.content {
			padding-top: 2vh;
			width: 94vw;
			height: 100vh;
			margin: 0 auto;
			// background-color: #acbcaa;


			.item {
				display: flex;
				margin-bottom: 2vh;

				* {
					margin-bottom: 10px;
				}

				image {
					width: 100px;
					height: 130px;
					border-radius: 15px;
				}

				.itemContent {
					padding-left: 4vw;
					display: flex;
					flex-direction: column;
					justify-content: center;

					.title {
						font-size: 20px;
						font-weight: 700;
					}


					.describe {
						color: #9f9f9f;
						width: 60vw;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					.dictLabelDiv {
						display: flex;
						flex-wrap: wrap;
						font-size: 12px;
						color: rgb(132, 132, 132);

						.dictLabel {
							border: 1px solid #969696;
							border-radius: 5px;
							padding: 1px 3px;
							margin-right: 5px;

						}

						.dictLabel:first-child {
							background-color: #f8f3e7;
							color: #e97741;
							border: 0;
						}


					}


				}


			}
		}
	}
</style>