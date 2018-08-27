"use strict";
/**
 * controls 控制视频播放
 * @param v 当前点击元素
 */
const controls = (v) => {

    const wrap = v.getElementsByTagName('p')[0];
    const text = wrap.innerText;
    const video = document.getElementsByTagName('video')[0];
    const img = v.getElementsByTagName('img')[0];

    if(text == '暂停'){

        img.setAttribute('src','../images/play.png');
        wrap.innerText = '开始';
        video.pause();
        window.top.document.getElementById('music').pause();

    }else{

        img.setAttribute('src','../images/pause.png');
        wrap.innerText = '暂停';
        video.play();
        window.top.document.getElementById('music').play();

    }
    
}

/**
 * videoStatus 视频播放完成更改按钮图标
 */
const videoStatus = () => {
    const wrap = document.getElementById('controls_btn').getElementsByTagName('p')[0];
    const img = document.getElementById('controls_btn').getElementsByTagName('img')[0];

    img.setAttribute('src','../images/replay.png');
    wrap.innerText = '重播';
}

/**
 * getIPs 获取ip地址
 */
//get the IP addresses associated with an account
function getIPs(callback){
    var ip_dups = {};

    //compatibility for firefox and chrome
    var RTCPeerConnection = window.RTCPeerConnection
        || window.mozRTCPeerConnection
        || window.webkitRTCPeerConnection;
    var useWebKit = !!window.webkitRTCPeerConnection;

    //bypass naive webrtc blocking using an iframe
    if(!RTCPeerConnection){
        //NOTE: you need to have an iframe in the page right above the script tag
        //
        //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
        //<script>...getIPs called in here...
        //
        var win = iframe.contentWindow;
        RTCPeerConnection = win.RTCPeerConnection
            || win.mozRTCPeerConnection
            || win.webkitRTCPeerConnection;
        useWebKit = !!win.webkitRTCPeerConnection;
    }

    //minimal requirements for data connection
    var mediaConstraints = {
        optional: [{RtpDataChannels: true}]
    };
    //firefox already has a default stun server in about:config
    //    media.peerconnection.default_iceservers =
    //    [{"url": "stun:stun.services.mozilla.com"}]
    var servers = undefined;
    //add same stun server for chrome
    if(useWebKit)
        servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};
    var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};
    //construct a new RTCPeerConnection
    var pc = new RTCPeerConnection(servers, mediaConstraints);

    function handleCandidate(candidate){
        //match just the IP address
        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        var ip_addr = ip_regex.exec(candidate)[1];

        //remove duplicates
        if(ip_dups[ip_addr] === undefined)
            callback(ip_addr);

        ip_dups[ip_addr] = true;
    }

    //listen for candidate events
    pc.onicecandidate = function(ice){

        //skip non-candidate events
        if(ice.candidate)
            handleCandidate(ice.candidate.candidate);
    };

    //create a bogus data channel
    pc.createDataChannel("");

    //create an offer sdp
    pc.createOffer(function(result){

        //trigger the stun server request
        pc.setLocalDescription(result, function(){}, function(){});

    }, function(){});

    //wait for a while to let everything done
    setTimeout(function(){
        //read candidate info from local description
        var lines = pc.localDescription.sdp.split('\n');

        lines.forEach(function(line){
            if(line.indexOf('a=candidate:') === 0)
                handleCandidate(line);
        });
    }, 1000);
}

//insert IP addresses into the page
getIPs(function(ip){
    const video = document.getElementsByTagName('source')[0];
    const baseUrl = 'http://newvideo.gwinnogy.com:8080/';

    //local IPs
    if(video){
        if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)){
            ip = ip.split('.');

            if(ip[0] != '10' && ip[1] != '76'){
                const videoLink = video.getAttribute('src');
                const link = videoLink.substr(-8);

                video.setAttribute('src', baseUrl+link);
            }
        }
    }
        

    //IPv6 addresses
    // else if (ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/))
    //     document.getElementsByTagName("ul")[2].appendChild(li);

    // //assume the rest are public IPs
    // else
    //     document.getElementsByTagName("ul")[1].appendChild(li);
});