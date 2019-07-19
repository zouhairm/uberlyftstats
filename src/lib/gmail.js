/**
 * Implements Gmail API search.
 * We will search for uber/lyft emails, and parse 
 * them into some interesting meta data ... 
 */

var Queue = require("queue-fifo");



const DEBUG = true;


// const SEARCH_QUERY = 'from: "Lyft Ride Receipt" OR from: "uber receipt" OR subject: "Uber Ride Receipt"'
// const SEARCH_QUERY = 'from: "lyft ride receipt" before:2016' 
const SEARCH_QUERY = 'from: "Lyft Ride Receipt" OR from: "uber receipts" OR subject: "Uber Ride Receipt"'

var MAX_BATCH_SIZE = 25;

var MAX_NUM_EMAILS = 10000;
var MAX_EMAILS_PER_PAGE = 200;
var THROTTLE_TIMEOUT = 200;

if (DEBUG)
{
  MAX_NUM_EMAILS = 10;
  MAX_EMAILS_PER_PAGE = 10;
}

import {parseEmail} from './emailParser.js'

export function fetchMetaData(gapi, output) {

  //this is the queue where we will store data
  let emailsQueue = {doneSearching: false, doneParsing: false, 
                     msgIdsQueue: new Queue(), 
                     parsedData: new Queue(), batchesAwaiting: 0}

  let initialQuery = {userId: 'me', maxResults: MAX_EMAILS_PER_PAGE, includeSpamTrash: true,
                      q: SEARCH_QUERY, 
                      }
  getMessages(gapi, initialQuery, emailsQueue)

  //getMessages will return since it's async.
  //We call another async function which will keep updating
  //output as more things are pushed in the queue!
  parseEmailsQueue(gapi, emailsQueue)


  output.allRides = []
  publishData(emailsQueue, output)
}


function parseEmailsQueue(gapi, emailsQueue)
{
  //getMessages signaled it's done and the queue is empty, so done!
  if (emailsQueue.doneSearching && emailsQueue.msgIdsQueue.isEmpty())
  {
    if(emailsQueue.batchesAwaiting > 0)
    {
      //console.log('emptied list queue, but still waiting on ' + emailsQueue.batchesAwaiting + ' batches to finis')
      setTimeout(()=> parseEmailsQueue(gapi, emailsQueue), 3*THROTTLE_TIMEOUT)
    }
    else
    {
      emailsQueue.doneParsing = true
    }
    return;
  }

  //pop up to 20 messages from the queue, setup a query, and send result to parser

  let batchSize = 0;
  let httpBatch = gapi.client.newBatch();
  while(! emailsQueue.msgIdsQueue.isEmpty() && batchSize < MAX_BATCH_SIZE)
  {
    let msgId = emailsQueue.msgIdsQueue.dequeue()
    let fetchQuery = gapi.client.gmail.users.messages.get({
        userId: 'me', 
        id: msgId,
        fields: 'internalDate,payload(body, mimeType, parts)',
      })
    httpBatch.add(fetchQuery, {id: ('get ' + msgId)});
    batchSize++;
  }
  if(batchSize > 0){
    emailsQueue.batchesAwaiting += 1
    //console.log('pushed a bunch of requests! batchSize ' + batchSize + ' - total batches =', emailsQueue.batchesAwaiting )
    httpBatch.then( (res) => handleBatchResponse(res, emailsQueue),
                    // eslint-disable-next-line 
                    (rej) => {console.error("REJECTED!", rej), emailsQueue.batchesAwaiting -= 1;})
  }

  //Recurse (but with a timeout to throttle things ...)
  setTimeout(()=> parseEmailsQueue(gapi, emailsQueue), THROTTLE_TIMEOUT)
}

function handleBatchResponse(res, emailsQueue)
{
  for (let k in res.result){
    emailsQueue.parsedData.enqueue(parseEmail(res.result[k].result))
  }
  emailsQueue.batchesAwaiting -= 1
  //console.log('Got results! (batches waiting: ' + emailsQueue.batchesAwaiting , res)
}

function publishData(emailsQueue, output)
{
  //getMessages signaled it's done and the queue is empty, so done!
  if (emailsQueue.doneParsing  && emailsQueue.parsedData.isEmpty())
  {
    //console.log('emptied parsed queue')
    return;
  }

  //push a stack of 10 at a time
  let batchedData = []
  while(! emailsQueue.parsedData.isEmpty() && batchedData.length < MAX_BATCH_SIZE)
  {
    batchedData.push(emailsQueue.parsedData.dequeue())
  }
  output.allRides.push(...batchedData)

  //Recurse (but with a timeout to throttle things ...)
  setTimeout(()=> publishData(emailsQueue, output), THROTTLE_TIMEOUT)
}



function getMessages(gapi, query, emailsQueue, nEmails = 0)
{
  //console.log('going to execute a request: ', query)
  let request = gapi.client.gmail.users.messages.list(query)


  request.execute(res => {
      // //console.log('received a response from gmail :D !', res)

      //put messages received into the queue
      res.messages.forEach(m => emailsQueue.msgIdsQueue.enqueue(m.id))
      nEmails += res.messages.length

      //Recurse to get the next page of results
      if (res.nextPageToken && nEmails < MAX_NUM_EMAILS) {
        let newquery = Object.assign({}, query)
        newquery.pageToken= res.nextPageToken

        getMessages(gapi, newquery, emailsQueue, nEmails)
      }
      else
      {
        // //console.log('got them all!')
        emailsQueue.doneSearching = true
      }
  })

}
