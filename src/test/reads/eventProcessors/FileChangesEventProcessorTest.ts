import { expect, assert } from 'chai';
import 'mocha';
import { mock, instance, when, verify, capture, resetCalls, anyString, anything } from 'ts-mockito';
import { toPromise } from '../../common/TestUtils';

import { UserActivityStatsService, DropboxFileChangeEvent } from "../../../main/reads/services/UserActivityStatsService"
import { FileChangesEventProcessor } from "../../../main/reads/eventProcessors/FileChangesEventProcessor"

const userActivityStatsServiceMock = mock(UserActivityStatsService)
const userActivityStatsService = instance(userActivityStatsServiceMock)

when(userActivityStatsServiceMock.processDropboxFileChangeEvents(anything())).thenReturn(Promise.resolve([]))

beforeEach(() => {
    resetCalls(userActivityStatsServiceMock)
})

describe('File Changes DynamoDB table event processors', () => {

    const unit = new FileChangesEventProcessor(userActivityStatsService)
    const _handler = (callback, dynamoDbStreamEvent) => unit.process(callback, dynamoDbStreamEvent)

    it('should process all records in the DynamoDb Stream event', async () => {
        await toPromise(_handler, dynamoDbStreamEventWith2Records)

        const [ fileChangeEvents ] = capture(userActivityStatsServiceMock.processDropboxFileChangeEvents).last()
        
        verify(userActivityStatsServiceMock.processDropboxFileChangeEvents(anything())).once()

        expect(fileChangeEvents).to.have.lengthOf(2)
        expect(fileChangeEvents[0].dropboxUserId).is.equal('my-dropbox-id')
        expect(fileChangeEvents[0].timestamp).to.deep.equal(new Date('2017-10-25T10:13:22Z'))
        expect(fileChangeEvents[1].timestamp).to.deep.equal(new Date('2017-10-25T10:13:25Z'))
    })

    it('should ignore an invalid event without user_id', async() => {
        await toPromise(_handler, dynamoDbStreamEventWithoutUserId)
        
        const [ fileChangeEvents ] = capture(userActivityStatsServiceMock.processDropboxFileChangeEvents).last()
        
        verify(userActivityStatsServiceMock.processDropboxFileChangeEvents(anything())).once()

        expect(fileChangeEvents).to.be.empty
    })

    it('should ignore an invalid event without timestamp', async() => {
        await toPromise(_handler, dynamoDbStreamEventWithoutTimestamp)
        
        const [ fileChangeEvents ] = capture(userActivityStatsServiceMock.processDropboxFileChangeEvents).last()
        
        verify(userActivityStatsServiceMock.processDropboxFileChangeEvents(anything())).once()

        expect(fileChangeEvents).to.be.empty
    })    
    
    it('should silently ignore totally malformed events', async() => { 
        await toPromise(_handler, totallyUnexpectedEvent)
        const [ fileChangeEvents ] = capture(userActivityStatsServiceMock.processDropboxFileChangeEvents).last()
        verify(userActivityStatsServiceMock.processDropboxFileChangeEvents(anything())).once()
        expect(fileChangeEvents).to.be.empty
    })
})


const dynamoDbStreamEventWith2Records = {
    "Records": [
        {
            "eventID": "ccad192a5b8d7ce8df412e2242f43833",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1508926380,
                "Keys": {
                    "account_id": {
                        "S": "dropbox-id-A"
                    },
                    "event_timestamp": {
                        "S": "2017-10-25T10:13:22Z"
                    }
                },
                "NewImage": {
                    "account_id": {
                        "S": "dropbox-id-A"
                    },
                    "user_id": {
                        "S": "my-dropbox-id"
                    },
                    "event_type": {
                        "S": "file"
                    },
                    "event_timestamp": {
                        "S": "2017-10-26T09:23:45Z"
                    }
                },
                "SequenceNumber": "100000000003735008969",
                "SizeBytes": 79,
                "StreamViewType": "KEYS_ONLY"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-1:0000:table/icarus-temp-dropbox_file_changes/stream/2017-10-25T09:40:54.513"
        },
        {
            "eventID": "eb2d7cc0e06ab6cd24e5a0c331391dce",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1508926380,
                "Keys": {
                    "account_id": {
                        "S": "dropbox-id-B"
                    },
                    "event_timestamp": {
                        "S": "2017-10-25T10:13:25Z"
                    }
                },
                "NewImage": {
                    "account_id": {
                        "S": "dropbox-id-B"
                    },
                    "user_id": {
                        "S": "my-dropbox-id"
                    },
                    "event_type": {
                        "S": "file"
                    },
                    "event_timestamp": {
                        "S": "2017-10-26T09:23:45Z"
                    }
                },
                "SequenceNumber": "200000000003735009677",
                "SizeBytes": 79,
                "StreamViewType": "KEYS_ONLY"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-1:0000:table/icarus-temp-dropbox_file_changes/stream/2017-10-25T09:40:54.513"
        }
    ]
}

const dynamoDbStreamEventWithoutUserId = {
    "Records": [
        {
            "eventID": "ccad192a5b8d7ce8df412e2242f43833",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1508926380,
                "Keys": {
                    "account_id": {
                        "S": "dropbox-id-A"
                    },
                    "event_timestamp": {
                        "S": "2017-10-25T10:13:22Z"
                    }
                },
                "NewImage": {
                    "account_id": {
                        "S": "dropbox-id-A"
                    },
                    "event_type": {
                        "S": "file"
                    },
                    "event_timestamp": {
                        "S": "2017-10-26T09:23:45Z"
                    }
                },
                "SequenceNumber": "100000000003735008969",
                "SizeBytes": 79,
                "StreamViewType": "KEYS_ONLY"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-1:0000:table/icarus-temp-dropbox_file_changes/stream/2017-10-25T09:40:54.513"
        }
    ]
}

const dynamoDbStreamEventWithoutTimestamp = {
    "Records": [
        {
            "eventID": "ccad192a5b8d7ce8df412e2242f43833",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1508926380,
                "Keys": {
                    "account_id": {
                        "S": "dropbox-id-A"
                    },
                    "event_timestamp": {
                        "S": "2017-10-25T10:13:22Z"
                    }
                },
                "NewImage": {
                    "account_id": {
                        "S": "dropbox-id-A"
                    },
                    "event_type": {
                        "S": "file"
                    },
                    "user_id": {
                        "S": "my-dropbox-id"
                    }
                },
                "SequenceNumber": "100000000003735008969",
                "SizeBytes": 79,
                "StreamViewType": "KEYS_ONLY"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-1:0000:table/icarus-temp-dropbox_file_changes/stream/2017-10-25T09:40:54.513"
        }
    ]
}

const totallyUnexpectedEvent = {
    foo: 'bar'
}