const axios = require('axios')
const apiKey = 'AIzaSyD98a7jFsEU8NYg8ma9f3g52Bxdm0ERwsI'
const baseApiUrl = "https://www.googleapis.com/youtube/v3"
const ytdl = require('ytdl-core');
let inputText;
let item;

exports.ViewSearchPage = (req, res) => {
    if (req.session.already_Logged === 'false' || req.session.already_Logged === undefined) {
        res.redirect('/')
    }
    else {
        res.render('search_page', {
           title:'Search'
        });
        console.log('search Page Rendered');
    }
}

exports.SearchProduct = async (req, res, next) => {
    try {
        const { search } = req.body;
        inputText = search;
        const url = `${baseApiUrl}/search?key=${apiKey}&type=video&part=snippet&q=${search}&maxResults=10`
        const response = await axios.get(url);
        const items = response.data.items;   //complete related json object
        nextPageToken = response.data.nextPageToken;
        if (items.length > 0) {
            AddViewsToResponseObject(items, ()=>{
                if (response.data.prevPageToken) {
                    prevPageToken = response.data.prevPageToken
                    res.render('search_page', {
                        items:item,
                        search: inputText,
                        next: nextPageToken,
                        prev: prevPageToken
                    })
                } else {
                    res.render('search_page', {
                        items:item,
                        search: inputText,
                        next: nextPageToken,
                    })
                }        
            });
        }
    }
    catch (err) {
        if (err.name == "AxiosError") {
            return res.render('search_page', {
                msg: 'API Key Expired. Please Check your API Key'
            })
        }
        else {
            return res.render('search_page', {
                msg: 'Something went wrong while getting data'
            })
        }
    }
}


exports.SearchProductWithPage = async (req, res, next) => {
    let pageToken = req.params.pageToken
    let search = inputText
    url = `${baseApiUrl}/search?key=${apiKey}&type=video&part=snippet&q=${search}&maxResults=10&pageToken=${pageToken}`
    const response = await axios.get(url)
    const items = response.data.items
    nextPageToken = response.data.nextPageToken
    if (items.length > 0) {
        AddViewsToResponseObject(items, ()=>{
            if (response.data.prevPageToken) {
                prevPageToken = response.data.prevPageToken
                res.render('search_page', {
                    items:item,
                    search: inputText,
                    next: nextPageToken,
                    prev: prevPageToken
                })
            } else {
                res.render('search_page', {
                    items:item,
                    search: inputText,
                    next: nextPageToken,
                })
            }          
        });
    }
}


exports.DownloadVideo = async (req, res) => {
    if (req.session.already_Logged === 'false' || req.session.already_Logged === undefined) {
        res.redirect('/')
    }
    else {
        try {
            let url = req.query.URL
            let id = req.query.id;
            if (url != undefined && id != undefined) {
                res.header('Content-Disposition', `attachment; filename="video${id}.mp4"`);
                console.log(`Video ${url} is Downloading...`);
                ytdl(url, {
                    format: 'mp4'
                }).pipe(res);
            }
        } catch {
            return;
        }
    }
}


exports.ViewVideo = async (req, res) => {
    if (req.session.already_Logged === 'false' || req.session.already_Logged === undefined) {
        res.redirect('/')
    }
    else {

        var Id = req.params.Id;
        if (Id != undefined) {
            const url = `${baseApiUrl}/videos?id=${Id}&key=${apiKey}&fields=items(id,snippet,statistics)&part=id,snippet,statistics`
            const response = await axios.get(url)
            const items = response.data.items;

            if (items.length > 0) {
                try {
                    const title = items[0].snippet.title;
                    var ReplaceTitleCharacter = title.replace("“", "").replace("”", "");
                    var suggestedVideoUrl = `${baseApiUrl}/search?key=${apiKey}&type=video&part=snippet&q=${ReplaceTitleCharacter}&maxResults=17`
                    const suggestedVideoResponse = await axios.get(suggestedVideoUrl)
                    var suggestedVideos = suggestedVideoResponse.data.items;
                    if (suggestedVideos.length > 0) {
                        for (let y = 0; y < suggestedVideos.length; y++) {
                            if (title == suggestedVideos[y].snippet.title) {
                                suggestedVideos.splice(y, 1);
                                break;
                            }
                        }
                    }

                    var CommentsApiUrl = `${baseApiUrl}/commentThreads?part=snippet,replies&videoId=${Id}&key=${apiKey}`
                    const CommentsResponse = await axios.get(CommentsApiUrl)
                    var comments = CommentsResponse.data.items;
                    console.log(comments.snippet.topLevelComment.snippet.authorProfileImageUrl);

                } catch {
                    return res.render('Video', {
                        Id,
                        comments,
                        totalComments: comments.length,
                        snippet: items[0].snippet,
                        items: items[0].statistics,
                        suggestedVideos,
                        title:'Video'
                    })
                }

                res.render('Video', {
                    Id,
                    comments,
                    totalComments: comments.length,
                    snippet: items[0].snippet,
                    items: items[0].statistics,
                    suggestedVideos,
                    title:'Video'
                });
            }
        }
    }
}
 

exports.ViewPlayList = async (req, res) => {
    if (req.session.already_Logged === 'false' || req.session.already_Logged === undefined) {
        res.redirect('/')
    }
    else {
        var channel = req.params.channel;
        if (channel != undefined) {
            const url = `${baseApiUrl}/playlists?part=snippet,contentDetails&channelId=${channel}&key=${apiKey}`
            const response = await axios.get(url)
            const items = response.data.items;
            if (items.length > 0) {
                console.log('PlayList Page Loaded');
                res.render('playlist', {
                    items,
                    channel: items[0].snippet.channelTitle,
                    title:'PlayList'
                })
            }
            else {
                res.render('playlist', {
                    msg: 'No Playlist Found',
                    title:'PlayList'
                })
            }
        }
    }
}

exports.GetPlayListVideos = async (req, res) => {
    if (req.session.already_Logged === 'false' || req.session.already_Logged === undefined) {
        res.redirect('/')
    }
    else {
        const PlaylistId = req.params.Id;
        const url = `${baseApiUrl}/playlistItems?part=snippet&playlistId=${PlaylistId}&key=${apiKey}&maxResults=30`
        const response = await axios.get(url)
        const items = response.data.items;
        
        if (items.length > 0) {
            res.render('playlistVideo', {
                items,
                channel: items[0].snippet.channelTitle
            })
        }
        else {
            res.render('playlistVideo', {
                msg: 'No Playlist Found'
            })
        }
    }
}

exports.checkAuthenticatedUser = (req, res) => {
    if (req.session.already_Logged === 'true') {
        res.render('home', {
            user: req.user
        })
    } else {
        res.render('index')
    }
}

exports.ViewProfilePage = (req, res) => {
    pic = req.session.user;
    res.render('home', {
        user: req.user,
        pic
    })
}

exports.logout = (req, res) => {
    req.session.already_Logged = 'false'
    res.render('index', {
        logoutMsg: 'User Logged Out Successfully'
    })
}

async function AddViewsToResponseObject (items, callback) {
    try {
        var videoIdList = [];
        for (let i = 0; i < items.length; i++) {
            videoIdList.push(items[i].id.videoId);
        }

        for (let z = 0; z < videoIdList.length; z++) {
            const url = `${baseApiUrl}/videos?id=${videoIdList[z]}&key=${apiKey}&fields=items(id,snippet,statistics)&part=id,snippet,statistics`
            const viewsResponse = await axios.get(url)
            const views = viewsResponse.data.items[0].statistics.viewCount;
            items[z].snippet.viewcount = views;         
        }
        item = items;
        callback(item);
    }
    catch { }
}
