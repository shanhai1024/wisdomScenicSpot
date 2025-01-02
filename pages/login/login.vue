<template>
	<view class="content">
		<view class="page">
			<view class="pageContent">
				<text class="title">欢迎登录智慧景区系统</text>
				<text class="tips">请登录:</text>
				<form>
					<input class="userNameInput" v-model="username" placeholder="请输入用户名" />
					<view class="passswordInputview uni-form-item">
						<input class="passswordInput uni-input" placeholder="请输入密码" v-model="password"
							:password="showPassword" />
						<uni-icons type="eye" size="30" @click="changePassword" color="rgb(2 ,135, 253)"
							v-if="showPassword"></uni-icons>
						<uni-icons type="eye-slash" size="30" @click="changePassword" v-else></uni-icons>
					</view>
					<checkbox value="rememberPassword" class="rememberPassword" />记住密码
					<button class="login" @click="login">登录</button>
					<text class="registrationPrompt"> 没有账号？去<text class="regins" @click="gotorgister">注册</text></text>
				</form>
			</view>
		</view>
		<view class="video-background">
			<video src="../../static/login/video.mp4" object-fit="cover" :autoplay="true" :controls="false"
				:muted="true" :loop="true" id="videoRef" class="video">
			</video>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	let username = ref('super')
	let password = ref("123456")
	let rememberPassword = ref(false)
	let showPassword = ref(true);

	function changePassword() {
		console.log("11111111");
		showPassword.value = !showPassword.value;
		console.log(showPassword.value);
	}

	function gotorgister() {
		uni.navigateTo({
			url: "/pages/register/register"
		})
	}
	/* function login() {
		uni.request({
			url: "http://59.46.190.164:7080/api/login",
			method: 'POST',
			data: {
				"username": username.value,
				"password": password.value
			},
			success: res => {//会产生回调地狱
				console.log(res)
				if (res.data.code == 200) {
					uni.setStorage({
						key: "token",
						data: res.data.token
					})
					uni.reLaunch({
						url: "/pages/index/index"
					})
				} else {
					uni.showToast({
						duration: 1500,
						title: "用户名或密码错误"
					})
				}
			}
		})
	} */
	/* 支持promise异步化 */
	/* function login() {
		uni.request({
			url: "http://59.46.190.164:7080/api/login",
			method: 'POST',
			data: {
				"username": username.value,
				"password": password.value
			}
		}).then(res => {
			console.log(res)
			if (res.data.code == 200) {
				uni.setStorage({
					key: "token",
					data: res.data.token
				})
				uni.reLaunch({
					url: "/pages/index/index"
				})
			} else {
				uni.showToast({
					duration: 1500,
					title: "用户名或密码错误"
				})
			}
		})
	} */
	/* 
	 异步同步化
	 */
	async function login() {
		let res = await uni.request({
			url: "http://59.46.190.164:7080/api/login",
			method: 'POST',
			data: {
				"username": username.value,
				"password": password.value
			}
		})
		console.log(res)
		if (res.data.code == 200) {
			uni.setStorage({
				key: "token",
				data: res.data.token
			})
			uni.reLaunch({
				url: "/pages/index/index"
			})
			console.log(res);
			console.log(uni.getStorageSync("token"));
		} else {
			uni.showToast({
				duration: 1500,
				title: "用户名或密码错误"
			})
		}
	}
</script>

<style lang="scss">
	.content {
		overflow: hidden;
		align-items: center;
		width: 100vw;
		height: 100vh;
		// background-color: #00d4ce;
		position: relative;

		.video-background {
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;

			.video {
				width: 100%;
				height: 100%;
			}
		}

		.page {
			position: absolute;
			z-index: 3;
			top: 0;
			right: 0;
			/* background-image: linear-gradient(to right, #43e97b 0%, #38f9d7 100%); */
			width: 100%;
			height: 100%;
			padding-top: 40px;

			.pageContent {

				margin: 0 auto;
				width: 80vw;
				height: 100%;
			}

			.title {
				color: #fff;
				font-size: 25px;
				font-weight: 500;
				margin-bottom: 30px;
				display: block;
				margin-top: 30px;
			}

			.tips {
				display: block;
				margin-top: 80px;
				color: #fff;
				margin-bottom: 10px;
			}

			form {

				color: #737373;
			}

			.userNameInput {
				background-color: rgba(255, 255, 255, 0.3);
				border-radius: 25px;
				height: 50px;
				font-weight: 30px;
				font-size: 20px;
				color: #fff;
				padding-left: 20px;
				margin: 10px 0;
			}

			.passswordInputview {
				display: flex;
				align-items: center;
				justify-content: space-between;
				background-color: rgba(255, 255, 255, 0.3);
				padding-left: 20px;
				border-radius: 25px;
				padding-right: 20rpx;

				.passswordInput {
					font-size: 20px;
					/* border-radius: 25px; */
					color: #fff;
					height: 50px;
					font-weight: 30px;
				}
			}

			.rememberPassword {
				color: #ccc;
			}

			.login {
				background-color: #ed9041;
				color: #fff;
				margin: 20px 0;
				border-radius: 25px;
			}

			.registrationPrompt {
				align-items: center;
				width: 200px;
				text-align: center;
				margin: 0 auto;
				color: #fff;
			}

			.regins {
				color: #ed9041;
			}
		}
	}
</style>