function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BlockEmbed = Quill.import('blots/block/embed');

var VideoBlot = function (_BlockEmbed3) {
    _inherits(VideoBlot, _BlockEmbed3);

    function VideoBlot() {
        _classCallCheck(this, VideoBlot);

        return _possibleConstructorReturn(this, _BlockEmbed3.apply(this, arguments));
    }

    VideoBlot.create = function create(url) {
        if(url.indexOf('dailymotion') > -1)
        {
            url = url.replace('www.dailymotion.com/','http://dailymotion.com/embed/');
        }else
        {
            console.log('yout');
            url = url.replace('watch?v=','embed/');
        }


        var node = _BlockEmbed3.create.call(this);
        node.setAttribute('src', url);
        node.setAttribute('frameborder', '0');
        node.setAttribute('allowfullscreen', true);
        return node;
    };

    VideoBlot.formats = function formats(node) {
        var format = {};
        if (node.hasAttribute('height')) {
            format.height = node.getAttribute('height');
        }
        if (node.hasAttribute('width')) {
            format.width = node.getAttribute('width');
        }
        return format;
    };

    VideoBlot.value = function value(node) {
        return node.getAttribute('src');
    };

    VideoBlot.prototype.format = function format(name, value) {
        if (name === 'height' || name === 'width') {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name, value);
            }
        } else {
            _BlockEmbed3.prototype.format.call(this, name, value);
        }
    };

    return VideoBlot;
}(BlockEmbed);

VideoBlot.blotName = 'videos';
VideoBlot.tagName = 'iframe';





var TweetBlot = function (_BlockEmbed4) {
    _inherits(TweetBlot, _BlockEmbed4);

    function TweetBlot() {
        _classCallCheck(this, TweetBlot);

        return _possibleConstructorReturn(this, _BlockEmbed4.apply(this, arguments));
    }

    TweetBlot.create = function create(id) {
        var node = _BlockEmbed4.create.call(this);
        id = id.split('/').pop();

        node.dataset.id = id;

        twttr.widgets.createTweet(id, node);
        return node;
    };

    TweetBlot.value = function value(domNode) {
        return domNode.dataset.id;
    };

    return TweetBlot;
}(BlockEmbed);

TweetBlot.blotName = 'tweet';
TweetBlot.tagName = 'div';
TweetBlot.className = 'tweet';

Quill.register(TweetBlot);
Quill.register(VideoBlot);

var toolbarOptions = [

    ['image','tweet','videos','link' ]
];


var editor = new Quill(
    '#editor',{
        debug: false,
        modules: {
            toolbar: toolbarOptions
        },
        // placeholder: 'Compose an epic...',
        theme: 'snow'
    }
);

    
document.querySelector('.ql-tweet').innerHTML = "<i class='fa fa-twitter'></i>"
document.querySelector('.ql-videos').innerHTML = "<i class='fa fa-play'></i>"