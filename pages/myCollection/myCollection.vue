<template>
	<view>
		<view class="savaList" v-for="item in saveList">
			<view class="savaListItem">
				<image mode="aspectFill" :src="`http://59.46.190.164:7080${item.cover}`"></image>
				<view class="savaIntroduce">
					<text class="title">{{item.title}}</text>
					<text class="describe">{{item.describe}}</text>
					<!-- starLevel -->
					<uni-rate v-model="item.starLevel" />
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


	let saveList = ref([])

	onLoad((i) => {
		console.log(i.id);
		getData(i.id)
	})


	function getData(id) {
		uni.request({
			url: "http://59.46.190.164:7080/appScenic/behavior/mySave?userId=" + id,
			method: 'GET',
			header: {
				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log(res.data.data)
			saveList.value = res.data.data;

		})
	}
</script>

<style lang="scss">
	.savaList {
		margin: 10px 20px;

		.savaListItem {
			display: flex;


			image {
				width: 25vw;
				height: 20vh;
				border-radius: 10px;
			}

			.savaIntroduce {
				margin-left: 10px;
				display: flex;
				justify-content: flex-start;
				align-content: stretch;
				flex-direction: column;

				.title {
					font-size: 25px
				}

				* {
					margin-top: 5px;
				}

			}
		}


	}
</style>