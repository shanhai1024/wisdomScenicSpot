<template>
	<view class="page">
		<image class="bg" src="../../static/my/bg.jpg"></image>
		<view class="content">
			<image src="" class="avatar"></image>

			<view class="myData">
				<view class="myDataItem" v-for="(item, index) in myData" :key="index" @click="gotoPage(item.id)">
					<text class="value">{{ item.value }}</text>
					<text>{{ item.label }}</text>
				</view>
			</view>

			<view class="list">
				<view class="list-item">
					<view>
						<image src="../../static/my/wallet.png"></image>
						<text>我的钱包</text>
					</view>
					<text class="arrow">></text>
				</view>

				<view class="list-item">
					<view>
						<image src="../../static/my/clear.png"></image>
						<text>清除缓存</text>
					</view>
					<view class="cache-info">
						<text>23.588M</text>
						<text class="arrow">></text>
					</view>
				</view>
			</view>

			<button @click="clickLogout" class="logout">退出登录</button>

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


	onLoad(() => {
		getUserInfoData()
	})
	// 数据定义
	let resure = ref({
		msg: "操作成功",
		code: 200,
		data: {
			isLike: 0,
			isSave: 0,
			isClick: 0,
			likeNum: 1,
			saveNum: 2,
			clickNum: 1,
			trackNum: 3
		}
	});


	let userInfo = ref()


	function gotoPage(i) {
		switch (i) {
			case 1:
				console.log(userInfo.value.userId)
				uni.navigateTo({
					url: '/pages/myFavorite/myFavorite?id=' + userInfo.value.userId
				})
				break;
			case 2:
				uni.navigateTo({
					url: "/pages/myCollection/myCollection?id=" + userInfo.value.userId
				})
				break;
			default:
				uni.navigateTo({
					url: "/pages/myFootprints/myFootprints?id=" + userInfo.value.userId
				})
		}
	}


	function clickLogout() {
		uni.showModal({
			title: "是否确认退出",
			cancelText: "取消",
			confirmText: "确定",
			complete: (res) => {
				if (res.confirm) {
					logout()
				}
			}
		})

	}

	function logout() {
		uni.request({
			url: "http://59.46.190.164:7080/logout",
			method: 'POST',
			header: {
				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log(res.data.code)

			if (res.data.code == 200) {
				uni.removeStorageSync('token')
				uni.reLaunch({
					url: "/pages/login/login"
				})
			}
		})

	}



	function getUserInfoData() {

		uni.request({
			url: "http://59.46.190.164:7080/appScenic/appUserInfo",
			method: 'POST',
			header: {
				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log(res.data.data)
			userInfo.value = res.data.data;

		})
	}



	// 提取 myData 以便于简化模板代码
	const myData = ref([{
			value: resure.value.data.likeNum,
			label: "喜欢",
			id: 1
		},
		{
			value: resure.value.data.saveNum,
			label: "收藏",
			id: 2
		},
		{
			value: resure.value.data.trackNum,
			label: "足迹",
			id: 3
		}
	]);
</script>

<style lang="scss">
	.page {
		.bg {
			width: 100vw;
		}

		.content {
			position: relative;
			width: 90vw;
			height: 90vh;
			background-color: #f8f8f8;
			padding: 15vw 5vw;
		}

		.avatar {
			position: absolute;
			left: 5vw;
			top: -50px;
			border-radius: 50%;
			width: 100px;
			height: 100px;
			background-color: #fff;
		}

		.myData {
			background-color: #fff;
			width: 100%;
			height: 70px;
			border-radius: 15px;
			display: flex;
			justify-content: space-around;

			.myDataItem {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;


				.value {
					font-size: 20px;
				}
			}
		}

		/* 通用的列表项样式 */
		.list {
			border-radius: 15px;
			background-color: #fff;


			.list-item {
				background-color: #fff;
				margin-top: 2px;
				height: 50px;
				display: flex;
				align-items: center;
				border-radius: 15px;
				padding: 0 3vw;
				justify-content: space-between;

				image {
					width: 30px;
					height: 30px;
				}

				.arrow {
					color: #ccc;
					font-size: 30px;
				}

				view {
					display: flex;
					align-items: center;
				}
			}
		}

		/* 清除缓存信息样式 */
		.cache-info {
			color: #ccc;
			display: flex;
			align-items: center;

			.text {
				color: #ccc;
			}
		}

		.logout {
			background-color: #fff;
			color: #9b9b9b;
			margin-top: 20px;
			// box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
			border: 0;

		}

		.logout::after {
			border: 0;
		}


	}
</style>