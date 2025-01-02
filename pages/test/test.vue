<template>
	<view class="content">
		<view class="imageList">
			<image v-for="(image, index) in images" :key="index" :src="image" @tap="previewImage(index)"
				mode="aspectFill" class="imageItem" />
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				images: [
					'http://59.46.190.164:7080/profile/scenic/album/cover/2023/02/08/711875a7-34b9-4a95-b73d-c817e24290ad.png',
					'http://59.46.190.164:7080/profile/scenic/album/cover/2023/02/08/dae59cae-5948-4ec3-97b5-9f98b0761db7.png',
					'http://59.46.190.164:7080/profile/scenic/album/cover/2023/02/08/e71f9a0d-7425-4c1a-bf2a-a9d4f813dd9b.png',
					'http://59.46.190.164:7080/profile/scenic/album/cover/2023/02/08/cd66f786-44d9-43ba-9859-95eb447a14c2.png'
				]
			};
		},
		methods: {
			previewImage(index) {
				uni.previewImage({
					current: this.images[index], // 当前显示图片的链接
					urls: this.images // 需要预览的图片链接列表
				});
			}
		}
	};
</script>

<style>
	.imageList {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.imageItem {
		width: 100px;
		height: 100px;
	}
</style>