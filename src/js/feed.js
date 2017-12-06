function createCard(data)
{
   var newCard ="<div class='clearfix'></div>" +
       "<div class='postcard card white hoverable'>" +
       "<div class='card-content'>" +
       "<div class='postquill'></div></div></div></div>";
   var newPost = $(newCard).prependTo('.post-area');

    newPost = newPost[1];

    var card = new Quill(newPost);
    card.setContents(data.post);
    card.enable(false);

}
function createResponsiveImg(){
    return $('.postcard').find('img').addClass('responsive-img');
}

function updateUI(data) {
    clearCards();
    for (var i = 0; i < data.length; i++) {
        createCard(data[i]);

    }
    createResponsiveImg();
}

function clearEditor()
{
   editor.setContents({});
}

function clearCards() {
    $('.postcard').remove();
}




var POSTURL = 'https://pwapp-f6d53.firebaseio.com/posts.json';
var networkDataReceived =false;
fetch(POSTURL)
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        networkDataReceived = true;
        console.log('From web', data);
        var dataArray = [];
        for (var key in data) {
            dataArray.push(data[key]);
            console.log(data[key]);
        }
        updateUI(dataArray);
    });


function sendData(postdata) {

    console.log('Send data',postdata);
    fetch('https://us-central1-pwapp-f6d53.cloudfunctions.net/storePost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(postdata)
    }).then(function(res) {
            console.log('Sent data', res);
            updateUI();
        }).catch(function(e){console.log(e)});
}

if ('indexedDB' in window) {
    readAllData('posts')
        .then(function(data) {
            if (!networkDataReceived) {

                updateUI(data);

            }
        });
}


$('#postdata').click(function(e){
    console.log('clickd');
    if((editor.getLength() !== 1) || (editor.getText().trim() !== "") )
    {
        var postdata = {
            id : new Date().toISOString(),
            post : editor.getContents()
        };
        console.log(postdata);
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready
                .then(function(sw) {
                    writeData('sync-posts', postdata).then(function() {
                            return sw.sync.register('sync-new-posts');
                        })
                        .then(function() {
                            Materialize.toast('Post Saved for Sync!', 4000);
                            clearEditor();
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                });
        } else {
            sendData(postdata);
        }
    }
    else
    {
        console.log('empty');
    }



});