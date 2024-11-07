/*
	Hielo by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
*/

var settings = {
	//首页滚动图行为配置
	banner: {
		// 是否启用图片底部的导航点
		indicators: true,
		// 翻页动作的持续时间(ms)
		// 必须与 "#banner > article" 相匹配.
		speed: 1500,
		// 翻页动作的等待时间(ms)
		delay: 5000,
		// 过渡强度(0-1 之间)
		parallax: 0.25
	}
};

(function ($) {

	// 不同设备类型进行宽度确定
	skel.breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * 对背景应用平滑滚动，返回的对象类型应是 JQuery 对象。
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = (skel.vars.browser == 'ie' || skel.vars.mobile) ? function () { return $(this) } : function (intensity) {
		// ie 不支持页内滑动行为，需要断定，若为这一情况则排除
		var $window = $(window), $this = $(this);
		if (this.length == 0 || intensity === 0)
			return $this;
		if (this.length > 1) {
			for (var i = 0; i < this.length; i++)
				$(this[i])._parallax(intensity);
			return $this;
		}
		//若没有指定滚动强度，默认为 0.25。
		if (!intensity)
			intensity = 0.25;

		/**
		 * 处理图片是否在前台的行为。
		 * on - 图片在前台
		 * off - 图片不在前台
		 */

		$this.each(function () {
			var $t = $(this),
				on, off; // 给每一个 banner 区域的图片打标记
			on = function () {
				// 若在前台，则将其居中处理
				$t.css('background-position', 'center 100%, center 100%, center 0px');
				$window
					.on('scroll._parallax', function () {
						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);
						$t.css('background-position', 'center ' + (pos * (-1 * intensity)) + 'px');
					});
			};
			off = function () {
				// 若不在前台，则将其
				$t
					.css('background-position', '');
				$window
					.off('scroll._parallax');
			};
			skel.on('change', function () {
				if (skel.breakpoint('medium').active)
					(off)();
				else
					(on)();
			});
		});
		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function () {
				$window.trigger('scroll');
			});
		return $(this);

	};

	/**
	 * 滑动行为的自定义控制。返回的为 JQuery 对象。
	 * @return {jQuery} jQuery object.
	 */
	$.fn._slider = function (options) {

		var $window = $(window),
			$this = $(this);

		if (this.length == 0)
			return $this;

		if (this.length > 1) {

			for (var i = 0; i < this.length; i++)
				$(this[i])._slider(options);

			return $this;

		}

		// Vars.
		var current = 0, pos = 0, lastPos = 0,
			slides = [], indicators = [],
			$indicators,
			$slides = $this.children('article'),
			intervalId,
			isLocked = false,
			i = 0;

		// Turn off indicators if we only have one slide.
		// 只有一张图片则不启用动画。
		if ($slides.length == 1)
			options.indicators = false;

		// Functions.
		$this._switchTo = function (x, stop) {
			// 如果监测到用户点击了某一张图片页面，直接锁定，不再进行切换，清空计时器
			if (isLocked || pos == x)
				return;
			isLocked = true; // 全局上锁
			if (stop)
				window.clearInterval(intervalId);  // 清空计时器
			// Update positions.
			// 更新图片的位置
			lastPos = pos;
			pos = x;

			// 若非前台要显示的图片，则隐藏.
			slides[lastPos].removeClass('top');
			if (options.indicators)
				indicators[lastPos].removeClass('visible');

			// 显示新的图片.
			slides[pos].addClass('visible').addClass('top');
			if (options.indicators)
				indicators[pos].addClass('visible');

			// 隐藏后，按所设置的时间等待，直至重新出现。
			window.setTimeout(function () {

				slides[lastPos].addClass('instant').removeClass('visible');

				window.setTimeout(function () {

					slides[lastPos].removeClass('instant');
					isLocked = false;

				}, 100);

			}, options.speed);

		};

		// 图片下方的指示器
		if (options.indicators)
			$indicators = $('<ul class="indicators"></ul>').appendTo($this);

		// 图片
		$slides
			.each(function () {

				var $slide = $(this),
					$img = $slide.find('img');

				// 图片序列处理
				$slide
					.css('background-image', 'url("' + $img.attr('src') + '")')
					.css('background-position', ($slide.data('position') ? $slide.data('position') : 'center'));

				// 并入序列
				slides.push($slide);

				// 指示器成员控制
				if (options.indicators) {

					var $indicator_li = $('<li>' + i + '</li>').appendTo($indicators);

					// 指示器具体实现，跳转至对应的照片。
					$indicator_li
						.data('index', i)
						.on('click', function () {
							$this._switchTo($(this).data('index'), true);
						});

					// 指示器成员并入指示器序列。
					indicators.push($indicator_li);

				}

				i++;

			})
			._parallax(options.parallax);

		// 对于滑动到的图片，将其置顶并赋予可见性。指示器同步变更。
		slides[pos].addClass('visible').addClass('top');

		if (options.indicators)
			indicators[pos].addClass('visible');

		// 单张照片不滑动。
		if (slides.length == 1)
			return;

		// 循环控制的主函数
		intervalId = window.setInterval(function () {

			current++;

			if (current >= slides.length)
				current = 0;

			$this._switchTo(current);

		}, options.delay);

	};

	$(function () {

		var $window = $(window),
			$body = $('body'),
			$header = $('#header'),
			$banner = $('.banner');

		// 直到全部加载完成之前，不启动任何动画。
		$body.addClass('is-loading');

		$window.on('load', function () {
			window.setTimeout(function () {
				$body.removeClass('is-loading');
			}, 100);
		});

		// 将每个图片对应的文本做居中处理。
		skel.on('+medium -medium', function () {
			$.prioritize(
				'.important\\28 medium\\29',
				skel.breakpoint('medium').active
			);
		});

		// 滑动
		$banner._slider(settings.banner);

		// 菜单行为配置。
		$('#menu')
			.append('<a href="#menu" class="close"></a>')
			.appendTo($body)
			.panel({
				delay: 500,
				hideOnClick: true,
				hideOnSwipe: true,
				resetScroll: true,
				resetForms: true,
				side: 'right'
			});

		// Header.
		if (skel.vars.IEVersion < 9)
			$header.removeClass('alt');

		if ($banner.length > 0
			&& $header.hasClass('alt')) {

			$window.on('resize', function () { $window.trigger('scroll'); });

			$banner.scrollex({
				bottom: $header.outerHeight(),
				terminate: function () { $header.removeClass('alt'); },
				enter: function () { $header.addClass('alt'); },
				leave: function () { $header.removeClass('alt'); $header.addClass('reveal'); }
			});

		}

	});

})(jQuery);