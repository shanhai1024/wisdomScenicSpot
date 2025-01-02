<template>

	<uni-nav-bar :border="false" style="width: 100%;" :fixed="false" left-icon="arrowleft" :title="data.data.title"
		color="#333333" background-color="#FFFFFF">
		<template v-slot:left>
			<uni-icons @click="leftClick()" type="left" size="30"></uni-icons>
		</template>
		<template v-slot:right>
			<uni-fav :circle="true" />
		</template>
	</uni-nav-bar>


	<view>
		<uni-swiper-dot :info="info" :current="current" field="content" :mode="mode">
			<swiper class="swiper" circular autoplay indicator-dots>
				<swiper-item v-for="(item, index) in swiperImgList" :key="index">
					<image :src="`http://59.46.190.164:7080${item}`" mode=""></image>
				</swiper-item>
			</swiper>
		</uni-swiper-dot>


		<view class="content">
			<view class="pageInfo">
				<text class="title">{{data.data.title}}</text>
				<view class="evaluation">
					<uni-rate :touchable="false" size="15" :value="data.data.starLevel" />
					<text>{{data.data.evaluationNum}}条评论</text>
				</view>
				<text class="describe">{{data.data.describe}}</text>
			</view>

			<view class="address">
				<view>
					<image src="../../static/index/icon/ars.png"></image>
					<text>{{data.data.location}}</text>

				</view>
				<view>
					<image src="../../static/index/icon/albumIcon.png"></image>
					<text>导览</text>
				</view>
			</view>


			<view class="ticketPurchaseView">
				<view class="ticketPurchaseItem" v-for="item in  ticketPurchaseData.scenicInfo">
					<view class="leftView">
						<text class="dictLabel">{{item.dictLabel}}</text>
						<view class="features">
							<text>今日可预定</text>
							<text style="color: #e0e0e0;">｜</text>
							<text>随时退</text>
						</view>
						<text class="saleNum">已售{{item.scenicTicket.saleNum}}</text>
					</view>
					<view class="rightView">
						<view>
							<text class="price">¥{{item.scenicTicket.price}}</text>
							<text>起</text>
						</view>
						<button class="scheduleButton" size="mini">预定</button>
					</view>




				</view>
			</view>

			<view class="introductionTitle">
				<text class="item1">｜</text>
				<text class="title">产品介绍</text>
			</view>

			<view class="introduction" v-html="data.data.introduction">
			</view>
		</view>
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
	let data = ref();
	let ticketPurchaseData = ref()
	let swiperImgList = ref([])



	function getTicketPurchaseData(id) {


		uni.request({
			method: 'GET',
			url: 'http://59.46.190.164:7080/appScenic/order/scenicInfo?scenicId=' + id,
			token: uni.getStorageSync('token'),
			header: {
				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log(res.data)
			ticketPurchaseData.value = res.data.data

		})

	}

	function leftClick() {
		uni.navigateBack()
	}


	async function getData(id) {
		await uni.request({
			method: 'GET',
			url: 'http://59.46.190.164:7080/appScenic/scenic/detail?id=' + id,
			token: uni.getStorageSync('token'),
			header: {

				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log(res.data)
			swiperImgList.value = res.data.data.imgList;
			data.value = res.data

		})
	}

	onLoad((options) => {

		getData(options.id);
		getTicketPurchaseData(options.id);

	});
</script>

<style lang="scss">
	.swiper {
		width: 100vw;

		swiper-item {
			width: 100%;
			height: 300px;

			image {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	}

	.content {
		width: 90vw;
		margin: 0 auto;
		// text-align: center;



		.pageInfo {
			display: flex;
			flex-direction: column;
			align-items: flex-start;

			.title {
				margin-top: 5px;
				font-size: 20px;
				font-weight: 700;
			}

			.evaluation {
				margin-top: 5px;
				display: flex;
				font-size: 12px;
				color: #ccc;
			}

			.describe {
				margin-top: 5px;
				font-size: 15px;
				color: #9b9b9b;
			}
		}

		.address {
			margin-top: 10px;
			display: flex;
			justify-content: space-between;
			color: #e86f35;
			font-size: 15px;
			width: 100%;
			background-color: #fdf5f1;
			border-radius: 25px;

			view {
				margin: 5px 10px;
			}

			image {
				width: 15px;
				height: 15px;
			}
		}


		.ticketPurchaseView {
			.ticketPurchaseItem {
				margin-top: 20px;
				width: 100%;
				height: 15vh;
				background-color: #f8f8f8;
				border-radius: 15px;
				display: flex;
				justify-content: space-between;

				.leftView {
					margin-left: 10px;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: flex-start;

					.dictLabel {
						font-size: 15px;
						font-weight: 700;
					}

					.features {
						color: #e86f35;
					}

					.saleNum {
						color: #ccc;
					}
				}

				.rightView {
					display: flex;
					flex-direction: column;
					justify-content: center;
					margin-right: 10px;

					view {
						font-size: 15px;
						color: #ccc;
					}

					.price {
						font-size: 20px;
						color: #e86f35;
					}

					.scheduleButton {
						margin-top: 5px;
						color: #fff;
						background-color: #e86f35;
						border-radius: 25px;
					}

				}

			}
		}

		.introductionTitle {
			display: flex;
			margin-top: 20px;

			.item1 {
				font-size: 20px;
				font-weight: 800;
				color: #e86f35;
			}

			.title {
				font-size: 20px;
			}
		}


	}

	.introduction {
		img {
			width: 90vw;
			margin: 0 auto;
		}
	}
</style>