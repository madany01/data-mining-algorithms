const { transpose } = require('../../array2d-utils')

function fillMissingValues(array) {
	const freqMap = new Map()

	array
		.filter(value => value !== null)
		.forEach(value => {
			const preFreq = freqMap.has(value) ? freqMap.get(value) : 0
			freqMap.set(value, preFreq + 1)
		})

	const freqArray = [...freqMap.entries()]

	const numNonMissingValues = freqArray.reduce((acc, [, freq]) => acc + freq, 0)

	const probArray = [...freqArray]
		.sort(([, freq1], [, freq2]) => freq1 - freq2)
		.map(([value, freq]) => [value, freq / numNonMissingValues])

	probArray.forEach((_, idx) => {
		probArray[idx][1] += idx === 0 ? 0 : probArray[idx - 1][1]
	})

	return array.map(value => {
		if (value !== null) return value
		const rand = Math.random()
		return probArray.find(([, prob]) => rand <= prob)[0]
	})
}

function getAttributeValuesSummary(array2d) {
	/*
	[
		{attr1V1: [n, p], attr1V2: [n, p], attr1V3: [n, p]},
		{attr2V1: [n, p], attr2V2: [n, p], attr2V3: [n, p]},
		..
	]
	*/
	return transpose(array2d)
		.map((attrRow, _, transposedArr) => [attrRow, transposedArr.at(-1)])
		.map(transpose)
		.map(attrDecision => attrDecision.reduce((map, [attrVal, decision]) => {
			if (!map.has(attrVal)) map.set(attrVal, [0, 0])
			map.get(attrVal)[decision]++
			return map
		}, new Map()))
}

function calcEntropy(n, p) {
	if (p === 0 || n === 0) return 0
	return -(p / (p + n)) * Math.log2(p / (p + n)) - (n / (p + n)) * Math.log2(n / (p + n))
}

function calcMatrixInfoGain(array2d) {
	const numSamples = array2d.length

	const attributeValuesSummary = getAttributeValuesSummary(array2d)

	const dataEntropy = calcEntropy(
		attributeValuesSummary.at(-1).get(0)[0],
		attributeValuesSummary.at(-1).get(1)[1],
	)

	const infoEntropies = attributeValuesSummary
		.slice(0, -1)
		.map(attrMap => (
			[...attrMap.values()].reduce((acc, [n, p]) => acc + (calcEntropy(n, p) * (n + p)) / numSamples, 0)
		))

	return infoEntropies.map(ie => dataEntropy - ie)
}
function calcContinuousThresholdValue(valuesArray, decisions) {
	const sortedUniqueValues = [...new Set(valuesArray)].sort((a, b) => a - b)

	console.assert(sortedUniqueValues.length >= 2)

	return sortedUniqueValues
		.reduce((best, _, idx) => {
			if (idx === 0) return null

			const threshold = (sortedUniqueValues[idx] + sortedUniqueValues[idx - 1]) / 2
			const [infoGain] = calcMatrixInfoGain(transpose([valuesArray.map(value => value > threshold), decisions]))

			if (best === null || infoGain > best.infoGain) return { threshold, infoGain }

			return best
		}, null)
}

module.exports = {
	calcContinuousThresholdValue,
	calcEntropy,
	calcMatrixInfoGain,
	fillMissingValues,
	getAttributeValuesSummary,
}