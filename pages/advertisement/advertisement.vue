<template>
	<view class="content">
		<view @click="goToLogin" class="skip">
			<text style="margin-left: 5px;">跳过</text>
			<uni-countdown @timeup="goToLogin" :color="'#747474'" :second="5" :show-day="false" :show-hour="false"
				:show-minute="false" />
		</view>

		<view class="pageData">
			<image class="headerImage" src="../../static/advertisement/headerIcon.jpg"></image>


			<text class="title">同游世界，共享风情</text>
			<br>
			<text class="field">一起去最美的远方</text>


			<button class="gotoButton" @click="goToLogin()">开始体验</button>

		</view>

	</view>
</template>

<script setup>
	function goToLogin() {
		console.log(1111)
		uni.reLaunch({
			url: "/pages/login/login"
		})
	}
</script>

<style lang="scss">
	.content {
		width: 100vw;
		height: 100vh;
		padding-top: 50px;
		// background-color: lightblue;

		.skip {
			box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
			font-size: 12px;
			border-radius: 25px;
			display: flex;
			align-items: center;
			width: 60px;
			height: 25px;
			color: #747474;
			background-color: #f6f6f6;
			margin-left: 80vw;
		}

		.pageData {
			display: flex;
			flex-direction: column;
			width: 90vw;
			margin: 0 auto;
			margin-top: 40px;
			align-items: center;
			// background-color: #00b4d0;

			.headerImage {

				width: 320px;
				height: 240px;
				margin: 20px auto;
			}

			.title {
				margin-top: 30px;
				font-size: 20px;
				font-weight: bold;
				color: #626262;
			}

			.field {
				font-size: 15px;
				color: #cac0b9;
			}

			.gotoButton {
				margin-top: 25vh;
				background-color: #ec7039;
				border-radius: 25px;
				width: 290px;
				color: #fff;
			}


		}


	}
</style>