<template>
	<view class="content">


		<view class="pageHader">
			<swiper class="swiper" indicator-dots='true' autoplay circular>
				<swiper-item>
					<image mode="widthFix" src="../../static/index/carouselChart/1191728953784_.pic.jpg"></image>
				</swiper-item>
				<swiper-item>
					<image mode="widthFix" src="../../static/index/carouselChart/1161728953781_.pic_hd.jpg"></image>
				</swiper-item>
				<swiper-item>
					<image mode="widthFix" src="../../static/index/carouselChart/1171728953782_.pic_hd.jpg"></image>
				</swiper-item>
				<swiper-item>
					<image mode="widthFix" src="../../static/index/carouselChart/1181728953783_.pic_hd.jpg"></image>
				</swiper-item>
			</swiper>

			<view class="menu">
				<view class="menuItem">
					<image src="../../static/index/icon/tickets.png"></image>
					<text>门票购买</text>
				</view>
				<view class="menuItem">
					<image src="../../static/index/icon/guidedTour.png"></image>
					<text>景区导览</text>
				</view>
				<navigator url="/pages/activities/activities" @click="gotoActivities">
					<view class="menuItem">
						<image src="../../static/index/icon/appointment.png"></image>
						<text>活动预约</text>
					</view>
				</navigator>
				<navigator url="/pages/raiders/raiders">
					<view class="menuItem">
						<image src="../../static/index/icon/raiders.png"></image>
						<text>游玩攻略</text>
					</view>
				</navigator>
			</view>
		</view>

		<view class="scenicSpotTickets">
			<view class="pagetitle">
				<view>
					<text style="font-size: 25px;  margin-right: 5px; color: #ed7e49;font-weight: 1000;">|</text>
					<text class="title">景区门票</text>
				</view>
				<text class="more">更多> </text>
			</view>
			<view class="ticketsList">

				<view class="ticketsListItem" @click="gotoInfo(item.id)" v-for="item in  result">
					<image mode="aspectFill" :src="`http://59.46.190.164:7080${item.cover}`">
					</image>
					<view class="itemcontent">
						<text class="title">{{item.title}}</text>

						<text class="Introduction">{{item.describe}}</text>
						<view style="display: flex; align-items: center;">
							<uni-rate allow-half :value="item.starLevel" :size="18" touchable="false" />
							<text>{{item.evaluationNum}} 条评价</text>
						</view>
						<view>
							<text class="price">¥{{item.price}}</text>
							<text>起</text>
						</view>
					</view>
				</view>

			</view>
		</view>
		<view class="activityReservation">
			<view class="pagetitle">
				<view>
					<text style="font-size: 25px;  margin-right: 5px; color: #ed7e49;font-weight: 1000;">|</text>
					<text class="title">活动预约</text>
				</view>
				<text class="more" @click="gotoActivities">更多> </text>
			</view>

			<view class="item">
				<image mode="aspectFill"
					src="http://59.46.190.164:7080/profile/scenic/activity/cover/2023/02/08/cb2e13ea-9266-4b52-b580-8cedbe986d38.png">
				</image>
				<view class="itemContent">
					<text class="title">侏罗纪欢乐岛</text>
					<text class="describe">欢乐岛整体以侏罗纪为年代背景，利用特色假山、沙地、雨林、恐龙骨胳进行造景.}</text>
					<view class="dictLabelDiv">
						<text class="dictLabel">体重在120kg以下</text>

					</view>
				</view>
			</view>

		</view>
		<view class="scenicAlbum">
			<view class="pagetitle">
				<view>
					<text style="font-size: 25px;  margin-right: 5px; color: #ed7e49;font-weight: 1000;">|</text>
					<text class="title">景区相册</text>
				</view>
				<text class="more" @click="gotoScenicAlbum">更多> </text>
			</view>

			<view class="albumContent">
				<view class="albumContentItem"
					:style="{ backgroundImage: `url(http://59.46.190.164:7080${item.coverPath})` }"
					v-for="item in listData">
					<view>
						<image class="albumIcon" src="../../static/index/icon/albumIcon.png"></image>
						<text class="title">{{item.title}}</text>
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
		onLaunch,
		onShow,
		onHide,
		onLoad
	} from '@dcloudio/uni-app'

	let result = ref()
	let listData = ref()
	let storageData = ref()




	onLoad((options) => {

		getResurt()
		getListData()

	});



	function getListData() {
		uni.request({
			method: 'GET',
			url: 'http://59.46.190.164:7080/appScenic/appAlbum/homeList?pageNum=1&pageSize=4',
			token: uni.getStorageSync('token'),
			header: {

				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log(res.data.code);
			if (res.data.code == 400 || res.data.code == 401) {
				// alert(11)
				gotoLogin()
			}
			listData.value = res.data.rows

		})
	}

	function gotoLogin() {
		uni.reLaunch({
			url: "/pages/login/login"
		})


	}

	function getResurt() {
		let sData = uni.getStorageSync("storageData")
		console.log("sData");
		console.log(sData);
		if (sData != null && sData !== '' && sData !== undefined) {
			console.log("有数据");
			result.value = sData

		} else {
			console.log("无数据");
			uni.request({
				method: 'GET',
				url: 'http://59.46.190.164:7080/appScenic/scenic/list?pageNum=1&pageSize=6',
				token: uni.getStorageSync('token'),
				header: {

					Authorization: uni.getStorageSync("token")
				}
			}).then(res => {
				// console.log(res.data.rows)
				result.value = res.data.rows
				uni.setStorageSync("storageData", res.data.rows)

			})

		}



	}

	function gotoScenicAlbum() {
		uni.navigateTo({
			url: "/pages/scenicAlbum/scenicAlbum"
		})
	}

	function gotoInfo(id) {
		console.log(id)
		uni.navigateTo({
			url: "/pages/showInfo/showInfo?id=" + id
		});
	}

	function gotoActivities() {
		uni.switchTab({
			url: "/pages/activities/activities"
		})
	}
</script>

<style lang="scss">
	.content {
		.pageHader {
			position: relative;

			.swiper {
				width: 100vw;
				height: 200px;
				background-color: #1db257;

				image {
					width: 100%;
				}
			}

			.menu {
				display: flex;
				width: 85vw;
				background-color: #fff;
				border-radius: 15px;
				margin: 0 auto;
				padding: 5px 8px;
				justify-content: space-around;
				position: absolute;
				left: 5%;
				bottom: -50px;
				box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);

				image {
					width: 40px;
					height: 40px;
					display: block;
				}

				text {
					margin-left: 10px;
				}

				.menuItem {
					display: flex;
					align-items: center;
					flex-direction: column;

				}
			}
		}


		.scenicSpotTickets {

			.pagetitle {
				display: flex;
				width: 90vw;

				margin: 0 auto;
				margin-top: 70px;
				align-items: center;
				display: flex;

				justify-content: space-between;

				.title {
					font-size: 20px;
					font-weight: bold;
				}

				.more {
					color: #a1a1a1;
					font-size: 15px;
					font-weight: bold;
				}

			}

			.ticketsList {
				width: 90vw;
				margin: 0 auto;
				// background-color: #1db257;
				margin-top: 20px;
				display: flex;
				flex-direction: column;

				.ticketsListItem {

					margin-top: 10px;
					display: flex;
					border-radius: 15px;
					width: 100%;
					// box-shadow: 0px -26px 50px -3px rgba(0, 0, 0, 0.1);

					image {
						border-radius: 15px;
						width: 25vw;
						height: 16vh;
					}

					.itemcontent {

						color: #a1a1a1;
						margin-top: 10px;
						margin-left: 10px;
						display: flex;
						flex-direction: column;


						.title {
							color: #000000;
							font-size: 18px;
							font-weight: bold;
						}

						.Introduction {
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}

						.price {
							color: #ed7038;
							font-size: 30px;
							margin-right: 5px;
						}
					}
				}
			}
		}

		.activityReservation {
			.pagetitle {
				display: flex;
				width: 90vw;

				margin: 0 auto;
				margin-top: 70px;
				align-items: center;
				display: flex;

				justify-content: space-between;

				.title {
					font-size: 20px;
					font-weight: bold;
				}

				.more {
					color: #a1a1a1;
					font-size: 15px;
					font-weight: bold;
				}

			}

			.item {
				display: flex;
				margin-bottom: 2vh;
				width: 90vw;
				margin: 0 auto;

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


		.scenicAlbum {
			.pagetitle {
				display: flex;
				width: 90vw;

				margin: 0 auto;
				margin-top: 70px;
				align-items: center;
				display: flex;

				justify-content: space-between;

				.title {
					font-size: 20px;
					font-weight: bold;
				}

				.more {
					color: #a1a1a1;
					font-size: 15px;
					font-weight: bold;
				}

			}

			.albumContent {
				width: 90vw;
				margin: 0 auto;
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 10px;


				.albumContentItem {
					height: 20vh;
					background-repeat: no-repeat;
					background-size: cover;
					// background-attachment: fixed;
					background-color: #1db257;

					.albumIcon {
						width: 30px;
						height: 30px;
					}

					view {
						display: flex;
						align-items: center;
						margin-top: 70%;
						color: #fff;
					}
				}
			}

		}
	}
</style>