const createId3Classifier = require('.')

describe('id3', () => {
	it('works when data has only 1 attribute', () => {
		const data = [
			['outlook', 'decision'],
			['cold', 0],
			['cold', 1],
			['cold', 1],
			['cool', 0],
			['cool', 0],
			['hot', 1],
		]
		const classifier = createId3Classifier(data)

		const rootNode = classifier.getRootNode()
		expect(rootNode.getNodeInfo()).toMatchObject({
			attribute: 'outlook',
			decisionsFrequency: [3, 3],
		})

		const coldLeaf = rootNode.getAdjacentNodes().get('cold')
		expect(coldLeaf.isLeaf()).toBe(true)
		expect(coldLeaf.getNodeInfo()).toMatchObject({
			decisionsFrequency: [1, 2],
			mostFrequentDecision: 1,
			decision: 1,
		})

		const hotLeaf = rootNode.getAdjacentNodes().get('hot')
		expect(hotLeaf.isLeaf()).toBe(true)
		expect(hotLeaf.getNodeInfo()).toMatchObject({
			decisionsFrequency: [0, 1],
			mostFrequentDecision: 1,
			decision: 1,
		})

		const coolLeaf = rootNode.getAdjacentNodes().get('cool')
		expect(coolLeaf.isLeaf()).toBe(true)
		expect(coolLeaf.getNodeInfo()).toMatchObject({
			decisionsFrequency: [2, 0],
			mostFrequentDecision: 0,
			decision: 0,
		})

		let result = classifier.classify({ outlook: 'cold' })
		expect(result.decision).toBe(1)
		expect(result.path).toEqual(['outlook'])

		result = classifier.classify({ outlook: 'cool' })
		expect(result.decision).toBe(0)
		expect(result.path).toEqual(['outlook'])

		result = classifier.classify({ outlook: 'hot' })
		expect(result.decision).toBe(1)
		expect(result.path).toEqual(['outlook'])
	})

	it('works: test data #1', () => {
		const data = [
			['outlook', 'temperature', 'humidity', 'wind', 'decision'],
			['sunny', 'hot', 'high', 'weak', 0],
			['sunny', 'hot', 'high', 'strong', 0],
			['overcast', 'hot', 'high', 'weak', 1],
			['rain', 'mild', 'high', 'weak', 1],
			['rain', 'cool', 'normal', 'weak', 1],
			['rain', 'cool', 'normal', 'strong', 0],
			['overcast', 'cool', 'normal', 'strong', 1],
			['sunny', 'mild', 'high', 'weak', 0],
			['sunny', 'cool', 'normal', 'weak', 1],
			['rain', 'mild', 'normal', 'weak', 1],
			['sunny', 'mild', 'normal', 'strong', 1],
			['overcast', 'mild', 'high', 'strong', 1],
			['overcast', 'hot', 'normal', 'weak', 1],
			['rain', 'mild', 'high', 'strong', 0],
		]
		const classifier = createId3Classifier(data)

		let result = classifier.classify({
			outlook: 'sunny',
			humidity: 'normal',
		})
		expect(result.decision).toBe(1)
		expect(result.path).toEqual(['outlook', 'humidity'])

		result = classifier.classify({
			outlook: 'sunny',
			humidity: 'high',
		})
		expect(result.decision).toBe(0)
		expect(result.path).toEqual(['outlook', 'humidity'])

		result = classifier.classify({
			outlook: 'overcast',
		})
		expect(result.decision).toBe(1)
		expect(result.path).toEqual(['outlook'])

		result = classifier.classify({
			outlook: 'rain',
			wind: 'weak',
		})
		expect(result.decision).toBe(1)
		expect(result.path).toEqual(['outlook', 'wind'])

		result = classifier.classify({
			outlook: 'rain',
			wind: 'strong',
		})
		expect(result.decision).toBe(0)
		expect(result.path).toEqual(['outlook', 'wind'])
	})

	it('returns correct tree with correct info', () => {
		const data = [
			['outlook', 'temperature', 'humidity', 'wind', 'decision'],
			['sunny', 'hot', 'high', 'weak', 0],
			['sunny', 'hot', 'high', 'strong', 0],
			['overcast', 'hot', 'high', 'weak', 1],
			['rain', 'mild', 'high', 'weak', 1],
			['rain', 'cool', 'normal', 'weak', 1],
			['rain', 'cool', 'normal', 'strong', 0],
			['overcast', 'cool', 'normal', 'strong', 1],
			['sunny', 'mild', 'high', 'weak', 0],
			['sunny', 'cool', 'normal', 'weak', 1],
			['rain', 'mild', 'normal', 'weak', 1],
			['sunny', 'mild', 'normal', 'strong', 1],
			['overcast', 'mild', 'high', 'strong', 1],
			['overcast', 'hot', 'normal', 'weak', 1],
			['rain', 'mild', 'high', 'strong', 0],
		]
		const classifier = createId3Classifier(data)
		const rootNode = classifier.getRootNode()

		expect(classifier.getTreeNodes().size).toBe(8)

		expect(rootNode.getNodeInfo().attribute).toEqual('outlook')
		expect(rootNode.getNodeInfo().gainRatio).toBeCloseTo(0.156)

		const humidityNode = rootNode.getAdjacentNodes().get('sunny')
		expect(humidityNode.getNodeInfo().attribute).toEqual('humidity')
		expect(humidityNode.getNodeInfo().gainRatio).toBeCloseTo(1.000)

		const windNode = rootNode.getAdjacentNodes().get('rain')
		expect(windNode.getNodeInfo().attribute).toEqual('wind')
		expect(windNode.getNodeInfo().gainRatio).toBeCloseTo(1.000)

		const outlookLeaf = rootNode.getAdjacentNodes().get('overcast')
		expect(outlookLeaf.isLeaf()).toBe(true)
		expect(outlookLeaf.getNodeInfo().decision).toBe(1)

		const humidityLeafHigh = humidityNode.getAdjacentNodes().get('high')
		expect(humidityLeafHigh.isLeaf()).toBe(true)
		expect(humidityLeafHigh.getNodeInfo().decision).toBe(0)

		const humidityLeafNormal = humidityNode.getAdjacentNodes().get('normal')
		expect(humidityLeafNormal.isLeaf()).toBe(true)
		expect(humidityLeafNormal.getNodeInfo().decision).toBe(1)

		const windLeafStrong = windNode.getAdjacentNodes().get('strong')
		expect(windLeafStrong.isLeaf()).toBe(true)
		expect(windLeafStrong.getNodeInfo().decision).toBe(0)

		const windLeafWeak = windNode.getAdjacentNodes().get('weak')
		expect(windLeafWeak.isLeaf()).toBe(true)
		expect(windLeafWeak.getNodeInfo().decision).toBe(1)
	})

	it('gives the right results on the training data', () => {
		const data = [
			['outlook', 'temperature', 'humidity', 'wind', 'decision'],
			['sunny', 'hot', 'high', 'weak', 0],
			['sunny', 'hot', 'high', 'strong', 0],
			['overcast', 'hot', 'high', 'weak', 1],
			['rain', 'mild', 'high', 'weak', 1],
			['rain', 'cool', 'normal', 'weak', 1],
			['rain', 'cool', 'normal', 'strong', 0],
			['overcast', 'cool', 'normal', 'strong', 1],
			['sunny', 'mild', 'high', 'weak', 0],
			['sunny', 'cool', 'normal', 'weak', 1],
			['rain', 'mild', 'normal', 'weak', 1],
			['sunny', 'mild', 'normal', 'strong', 1],
			['overcast', 'mild', 'high', 'strong', 1],
			['overcast', 'hot', 'normal', 'weak', 1],
			['rain', 'mild', 'high', 'strong', 0],
		]
		const classifier = createId3Classifier(data)
		const samples = data
			.slice(1)
			.map(row => row.reduce((acc, value, idx) => {
				acc[data[0][idx]] = value
				return acc
			}, {}))

		samples.forEach(sample => {
			const sampleToSend = { ...sample }
			delete sampleToSend.decision
			expect(classifier.classify(sampleToSend).decision).toBe(sample.decision)
		})
	})

	it('chooses the correct threshold', () => {
		const data = [
			['A', 'decision'],
			[0, 0],
			[5, 0],
			[10, 1],
			[15, 0],
			[20, 0],
			[25, 1],
			[30, 0],
			[35, 0],
			[40, 0],
			[50, 1],
			[55, 1],
			[60, 1],
			[65, 1],
			[70, 0],
			[75, 0],
			[80, 1],
			[85, 1],
			[90, 1],
			[95, 1],
			[100, 1],
		]
		const classifier = createId3Classifier(data, ['A'])
		expect(classifier.getRootNode().getNodeInfo().gainRatio).toBeCloseTo(0.3261045752)
		expect(classifier.getRootNode().getNodeInfo().threshold).toBe(77.5)
	})

	it('classifies object even when has missing values', () => {
		const data = [
			['outlook', 'temperature', 'humidity', 'wind', 'decision'],
			['sunny', 'hot', 'high', 'weak', 0],
			['sunny', 'hot', 'high', 'strong', 0],
			['overcast', 'hot', 'high', 'weak', 1],
			['rain', 'mild', 'high', 'weak', 1],
			['rain', 'cool', 'normal', 'weak', 1],
			['rain', 'cool', 'normal', 'strong', 0],
			['overcast', 'cool', 'normal', 'strong', 1],
			['sunny', 'mild', 'high', 'weak', 0],
			['sunny', 'cool', 'normal', 'weak', 1],
			['rain', 'mild', 'normal', 'weak', 1],
			['sunny', 'mild', 'normal', 'strong', 1],
			['overcast', 'mild', 'high', 'strong', 1],
			['overcast', 'hot', 'normal', 'weak', 1],
			['rain', 'mild', 'high', 'strong', 0],
		]
		const classifier = createId3Classifier(data)
		expect(classifier.classify({ outlook: 'sunny' })).toEqual({
			decision: 0, path: ['outlook', 'humidity'],
		})
		expect(classifier.classify({ outlook: 'sunny', humidity: 'nonExistVal' })).toEqual({
			decision: 0, path: ['outlook', 'humidity'],
		})
	})

	it('calculates attributeValuesFrequencies correctly', () => {
		const data = [
			['outlook', 'temperature', 'humidity', 'wind', 'decision'],
			['sunny', 'hot', 'high', 'weak', 0],
			['sunny', 'hot', 'high', 'strong', 0],
			['overcast', 'hot', 'high', 'weak', 1],
			['rain', 'mild', 'high', 'weak', 1],
			['rain', 'cool', 'normal', 'weak', 1],
			['rain', 'cool', 'normal', 'strong', 0],
			['overcast', 'cool', 'normal', 'strong', 1],
			['sunny', 'mild', 'high', 'weak', 0],
			['sunny', 'cool', 'normal', 'weak', 1],
			['rain', 'mild', 'normal', 'weak', 1],
			['sunny', 'mild', 'normal', 'strong', 1],
			['overcast', 'mild', 'high', 'strong', 1],
			['overcast', 'hot', 'normal', 'weak', 1],
			['rain', 'mild', 'high', 'strong', 0],
		]
		const classifier = createId3Classifier(data)
		const outlookNode = classifier.getRootNode()

		expect(outlookNode.getNodeInfo()).toMatchObject({
			attribute: 'outlook',
			attributeValuesFrequencies: new Map([['sunny', 5], ['overcast', 4], ['rain', 5]]),
			mostFrequentAttributeValue: 'sunny',
		})

		const humidityNode = outlookNode.getAdjacentNodes().get('sunny')

		expect(humidityNode.getNodeInfo()).toMatchObject({
			attribute: 'humidity',
			attributeValuesFrequencies: new Map([['high', 3], ['normal', 2]]),
			mostFrequentAttributeValue: 'high',
		})

		expect(classifier.classify({ })).toMatchObject({
			path: ['outlook', 'humidity'],
		})

		const windNode = outlookNode.getAdjacentNodes().get('rain')

		expect(windNode.getNodeInfo()).toMatchObject({
			attribute: 'wind',
			attributeValuesFrequencies: new Map([['weak', 3], ['strong', 2]]),
			mostFrequentAttributeValue: 'weak',
		})

		expect(classifier.classify({ outlook: 'rain' })).toMatchObject({
			path: ['outlook', 'wind'],
		})
	})

	it('works with missing values in data', () => {
		const data = [
			['redun1', 'redun2', 'outlook', 'decision'],
			['v', null, 'sunny', 1],
			['v', null, 'sunny', 1],
			['v', null, 'cold', 0],
			['v', null, null, 0],
			['v', null, 'cold', 0],
		]
		const classifier = createId3Classifier(data)
		expect(classifier.getTreeNodes().size).toBe(3)
		const nodeInfo = classifier.getRootNode().getNodeInfo()
		expect(nodeInfo.attribute).toBe('outlook')
		expect([...nodeInfo.attributeValuesFrequencies.values()].reduce((acc, v) => acc + v, 0)).toBe(5)
	})

	it('prunes the tree when child nodes are leaves of the same decision', () => {
		const data = [
			['wind', 'outlook', 'decision'],
			['strong', 'sunny', 0],
			['strong', 'sunny', 1],
			['strong', 'sunny', 0],
			['strong', 'rain', 0],
			['strong', 'rain', 1],
			['strong', 'rain', 0],
			['strong', 'overcast', 0],
			['strong', 'overcast', 1],
			['strong', 'overcast', 0],
			['weak', 'sunny', 1],
			['weak', 'sunny', 1],
			['weak', 'sunny', 1],
			['weak', 'rain', 1],
			['weak', 'rain', 1],
			['weak', 'rain', 1],
			['weak', 'overcast', 1],
			['weak', 'overcast', 1],
			['weak', 'overcast', 1],
		]
		const classifier = createId3Classifier(data)

		expect(classifier.getTreeNodes().size).toBe(3)

		const root = classifier.getRootNode()

		expect(root.getNodeInfo().attribute).toBe('wind')

		const prunedNode = root.getAdjacentNodes().get('strong')

		expect(prunedNode.isLeaf()).toBe(true)

		expect(prunedNode.getNodeInfo()).toMatchObject({
			isPruned: true,
			decision: 0,
			attribute: 'outlook',
		})

		expect(classifier.classify({ wind: 'strong' })).toMatchObject({
			decision: 0,
			path: ['wind'],
		})
		expect(classifier.classify({ wind: 'weak' })).toMatchObject({
			decision: 1,
			path: ['wind'],
		})
	})

	it('does not prune the tree when child nodes are of different decision', () => {
		const data = [
			['outlook', 'decision'],
			['sunny', 0],
			['sunny', 1],
			['sunny', 0],
			['rain', 1],
			['rain', 0],
			['rain', 1],
			['overcast', 0],
			['overcast', 1],
			['overcast', 0],
		]
		const classifier = createId3Classifier(data)

		expect(classifier.getTreeNodes().size).toBe(4)
		expect(classifier.getRootNode().isLeaf()).toBe(false)
	})

	it('does not prune the tree when child nodes are not leaved', () => {
		const data = [
			['a1', 'a1', 'decision'],
			['0', '0', 0],
			['0', '1', 1],
			['1', '1', 0],
			['1', '0', 1],
		]
		const classifier = createId3Classifier(data)

		expect(classifier.getTreeNodes().size).toBe(7)
	})
})
