import { expect, assert } from 'chai';
import 'mocha';
import { mock, instance, when, verify, capture, resetCalls, anyString, anything } from 'ts-mockito';
import { toPromise } from '../../common/TestUtils';

import { UserActivityStatsService, DropboxFileChangeEvent } from "../../../main/reads/services/UserActivityStatsService"
import { GithubEventProcessor } from "../../../main/reads/eventProcessors/GithubEventProcessor"

const userActivityStatsServiceMock = mock(UserActivityStatsService)
const userActivityStatsService = instance(userActivityStatsServiceMock)

when(userActivityStatsServiceMock.processGithubEvents(anything())).thenReturn(Promise.resolve([]))

beforeEach(() => {
    resetCalls(userActivityStatsServiceMock)
})

describe('Github Events processors', () => {
    
    const unit = new GithubEventProcessor(userActivityStatsService)
    const _handler = (callback, dynamoDbStreamEvent) => unit.process(callback, dynamoDbStreamEvent)

    it('should process all records in the DynamoDb Stream event', async () => {
        await toPromise(_handler, dynamoDbStreamEventWith2Records)

        const [ githubEvents ] = capture(userActivityStatsServiceMock.processGithubEvents).last()
        
        verify(userActivityStatsServiceMock.processGithubEvents(anything())).once()

        expect(githubEvents).to.have.lengthOf(2)
        expect(githubEvents[0].githubUsername).is.equal('my-github-user')
        expect(githubEvents[0].timestamp).to.deep.equal(new Date('2017-10-26T13:02:47+01:00'))
        expect(githubEvents[1].timestamp).to.deep.equal(new Date('2017-10-26T13:02:30+01:00'))
    })

    it('should skip records from DynamoDb Stream if it does not contain usernamne', async () => {
        await toPromise(_handler, dynamoDbStreamEventWithoutUsername)

        const [ githubEvents ] = capture(userActivityStatsServiceMock.processGithubEvents).last()

        verify(userActivityStatsServiceMock.processGithubEvents(anything())).once()
        
        expect(githubEvents).to.be.empty
    })

    it('should skip records from DynamoDb Stream if it does not contain a timestamp', async () => {
        await toPromise(_handler, dynamoDbStreamEventWithoutTimestamp)

        const [ githubEvents ] = capture(userActivityStatsServiceMock.processGithubEvents).last()

        verify(userActivityStatsServiceMock.processGithubEvents(anything())).once()
        
        expect(githubEvents).to.be.empty
    })

    it('should silently ignore totally malformed events', async() => {
        await toPromise(_handler, totallyUnexpectedEvent)
        
        const [ githubEvents ] = capture(userActivityStatsServiceMock.processGithubEvents).last() 
        
        verify(userActivityStatsServiceMock.processGithubEvents(anything())).once()
        
        expect(githubEvents).to.be.empty
    })
})

const dynamoDbStreamEventWith2Records = {
    "Records": [
        {
            "eventID": "91e74be5ffe635a820fa5cfceeaf431a",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1509019320,
                "Keys": {
                    "id": {
                        "S": "nicusX-056bf065948a2403aefa2e354f"
                    }
                },
                "NewImage": {
                    "event_type": {
                        "S": "commit"
                    },
                    "id": {
                        "S": "nicusX-056bf065948a2403aefa2e354fa"
                    },
                    "event_timestamp": {
                        "S": "2017-10-26T13:02:47+01:00"
                    },
                    "username": {
                        "S": "my-github-user"
                    }
                },
                "SequenceNumber": "5215500000000019467415331",
                "SizeBytes": 162,
                "StreamViewType": "NEW_IMAGE"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-1:006393696278:table/icarus-temp-github_events/stream/2017-10-26T11:59:33.387"
        },
        {
            "eventID": "91f2e0bb24949834dec1baba058919c5",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1509019320,
                "Keys": {
                    "id": {
                        "S": "nicusX-0ce7232ef34f25d262b7c53ef5af"
                    }
                },
                "NewImage": {
                    "event_type": {
                        "S": "commit"
                    },
                    "id": {
                        "S": "nicusX-0ce7232ef34f25d262b7c53ef5af"
                    },
                    "event_timestamp": {
                        "S": "2017-10-26T13:02:30+01:00"
                    },
                    "username": {
                        "S": "my-github-user"
                    }
                },
                "SequenceNumber": "5215600000000019467415428",
                "SizeBytes": 162,
                "StreamViewType": "NEW_IMAGE"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-1:006393696278:table/icarus-temp-github_events/stream/2017-10-26T11:59:33.387"
        }
    ]
}


const dynamoDbStreamEventWithoutUsername = {
    "Records": [
        {
            "eventID": "91e74be5ffe635a820fa5cfceeaf431a",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1509019320,
                "Keys": {
                    "id": {
                        "S": "nicusX-056bf065948a2403aefa2e354f"
                    }
                },
                "NewImage": {
                    "event_type": {
                        "S": "commit"
                    },
                    "id": {
                        "S": "nicusX-056bf065948a2403aefa2e354fa"
                    },
                    "event_timestamp": {
                        "S": "2017-10-26T13:02:47+01:00"
                    }
                },
                "SequenceNumber": "5215500000000019467415331",
                "SizeBytes": 162,
                "StreamViewType": "NEW_IMAGE"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-1:006393696278:table/icarus-temp-github_events/stream/2017-10-26T11:59:33.387"
        }
    ]
}

const dynamoDbStreamEventWithoutTimestamp = {
    "Records": [
        {
            "eventID": "91e74be5ffe635a820fa5cfceeaf431a",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1509019320,
                "Keys": {
                    "id": {
                        "S": "nicusX-056bf065948a2403aefa2e354f"
                    }
                },
                "NewImage": {
                    "event_type": {
                        "S": "commit"
                    },
                    "id": {
                        "S": "nicusX-056bf065948a2403aefa2e354fa"
                    },
                    "username": {
                        "S": "my-github-user"
                    }
                },
                "SequenceNumber": "5215500000000019467415331",
                "SizeBytes": 162,
                "StreamViewType": "NEW_IMAGE"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-1:006393696278:table/icarus-temp-github_events/stream/2017-10-26T11:59:33.387"
        }
    ]
}

const totallyUnexpectedEvent = {
    foo: 'bar'
}