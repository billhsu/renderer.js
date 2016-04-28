(function($) {
    $.fn.verticalCenter = function(watcher) {
        var $el = this;
        var $watcher = $(watcher);
        $el.ready(function() {
            _changeCss($el, $watcher);
            $watcher.bind("resize", function() {
                _changeCss($el, $watcher);
            });
            $watcher.bind("load", function() {
                _changeCss($el, $watcher);
            });
        });
    };

    function _changeCss($self, $container) {
        var dw = $container.width();
        var dh = $container.height();
        var w = dw * 0.8;
        var h = w * $self.height() / $self.width();
        if (dh > h) {
            $self.css({
                position: 'absolute',
                top: (dh / 2 - h / 2) + 'px',
                left: (dw / 2 - w / 2) + 'px',
                width: w
            });
        }
    }
})(jQuery);

$(function() {
  $("#canvas").verticalCenter(window);
});
