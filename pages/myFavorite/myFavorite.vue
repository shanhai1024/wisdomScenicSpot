<template>
	<view>

		<view class="favoriteList">


			<view class="favoriteListItem" v-for="item in favoriteList">
				<text class="createTime">{{item.createTime}}</text>
				<view class="list" v-for="listItem in item.scenicVOList">
					<image mode="aspectFill" :src="`http://59.46.190.164:7080${listItem.cover}`"></image>
					<view class="introduce">
						<text class="title">{{listItem.title}}</text>
						<text class="describe">{{listItem.describe}}</text>
					</view>
				</view>
			</view>

		</view>

	</view>
</template>

<script setup>
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		ref
	} from 'vue';


	let favoriteList = ref([])

	onLoad((i) => {
		console.log(i.id);
		getData(i.id)
	})


	function getData(id) {
		uni.request({
			url: "http://59.46.190.164:7080/appScenic/behavior/myLike?userId=" + id,
			method: 'GET',
			header: {
				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log(res.data.data)
			favoriteList.value = res.data.data;

		})
	}
</script>

<style lang="scss">
	.favoriteList {
		.createTime {
			margin: 10px 0;
			width: 100vw;
			height: 40px;
			background-color: #cdcdcd;
		}

	}

	.list {
		margin-left: 20px;
		margin-top: 10px;
		display: flex;

		image {
			border-radius: 10px;
			width: 25vw;
			height: 20vh;
		}

		.introduce {
			margin-left: 10px;
			display: flex;
			align-content: center;
			flex-direction: column;
			justify-content: flex-start;
			align-items: stretch;

			.title {
				font-size: 25px;
				margin-bottom: 10px;
			}

		}
	}
</style>