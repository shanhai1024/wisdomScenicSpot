<template>
	<view class="content">
		<view class="list">
			<view class="listItem" v-for="item in footprintsList">
				<!-- <text>{{item}}</text> -->
				<text class="createTime">{{item.createTime}}</text>
				<view class="item" v-for="scenicVOItem in item.scenicVOList">
					<text class="title">{{scenicVOItem.title}}</text>
					<text class="behaviorObj">{{scenicVOItem.behaviorObj}}</text>
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


	let footprintsList = ref([])

	onLoad((i) => {
		console.log(i.id);
		getData(i.id)
	})


	function getData(id) {
		uni.request({
			url: "http://59.46.190.164:7080/appScenic/behavior/myFoot?userId=" + id,
			method: 'GET',
			header: {
				Authorization: uni.getStorageSync("token")
			}
		}).then(res => {
			console.log(res.data.rows)
			footprintsList.value = res.data.rows;

		})
	}
</script>

<style lang="scss" scoped>
	.content {
		width: 100vw;
		height: 100vh;
		background-color: #ccc;
	}

	.createTime {
		width: 100vw;
		height: 40px;

	}

	.item {
		padding: 10px 20px;
		border: 1px solid #ccc;
		width: 100vw;
		height: 60px;
		background-color: white;
		display: flex;
		flex-direction: column;
		// margin: 10px;


		.title {
			font-size: 20px
		}

		.behaviorObj {
			color: #ccc;
		}
	}
</style>