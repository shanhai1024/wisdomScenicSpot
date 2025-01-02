<template>
	<view class="contentView">
		<view class="content">
			<text class="title">欢迎注册智慧景区</text>

			<text class="tips">
				请注册:
			</text>
			<input class="username" focus placeholder="请输入用户名" />

			<view class="uni-input-wrapper">
				<input class="userpassword" placeholder="请输入密码" :password="showPassword" />
				<text class="uni-icon" :class="[!showPassword ? 'uni-eye-active' : '']"
					@click="changePassword">&#xe568;</text>
			</view>

			<input class="nicename" focus placeholder="请输入昵称" />
			<button class="login">注册</button>


			<checkbox value="agreeOrNot" />我已同意
		</view>

	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	let showPassword = ref(false)
	let agreeOrNot = ref(false)
</script>

<style lang="scss">
	.content {
		width: 80vw;
		color: #707070;
		margin: 0 auto;

		// height: 100vh;
		.title {
			font-size: 25px;
			// font-weight: 700;
			margin-top: 50px;
		}

		.tips {
			margin-top: 50px;
			display: block;
		}

		.login {
			background-color: #ed9041;
			color: #fff;
			margin: 20px 0;
			border-radius: 25px;
		}

		input {
			border: 1px #ee9241 solid;
			border-radius: 25px;
			height: 50px;
			padding-left: 20px;
			margin: 10px 0;
		}



	}
</style>