/**
 * Implements Gmail API search.
 * We will search for uber/lyft emails, and parse 
 * them into some interesting meta data ... 
 */


export function fetchMetaData(gapi, output) {
  console.log('got new gapi',gapi)
  output.allMessages = []
  output.counter = 0
  //TODO: batch with uber? or maybe just OR the search ?
  let initialQuery = {userId: 'me', q: 'from: Lyft Ride Receipt'}

  getMessages(gapi, initialQuery, output)

}


function getMessages(gapi, query, output)
{
  console.log('going to execute a request: ', query)
  let request = gapi.client.gmail.users.messages.list(query)


  request.execute(res => {
      console.log('received a response from gmail :D !', res)
      output.allMessages.push(...res.messages)

      //TODO: do something more useful with the messages!
      output.counter += res.messages.length;

      if (res.nextPageToken) {
        let newquery = {userId: query.userId, q: query.q,  pageToken: res.nextPageToken}
        getMessages(gapi, newquery, output)
      }
      else
      {
        console.log('got them all!')
      }
  })

}
