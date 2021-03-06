function createId3Classifier({ rootNode, continuousAttributes }) {
	const nodes = getAllTreeNodes(rootNode)

	function objectHasValidAttributeValue(object, attribute, node) {
		if (!(attribute in object)) return false

		const nodeInfo = node.getNodeInfo()
		const adjacentNodes = node.getAdjacentNodes()
		const attributeValue = object[attribute]

		if (nodeInfo.isContinuous) return Number.isFinite(attributeValue)
		return adjacentNodes.has(attributeValue)
	}

	function classify(object) {
		let node = rootNode
		const path = []
		let decision = null

		while (true) {
			const nodeInfo = node.getNodeInfo()

			if (node.isLeaf()) {
				decision = nodeInfo.decision
				break
			}

			const { attribute } = nodeInfo
			path.push(attribute)

			let edge

			if (!objectHasValidAttributeValue(object, attribute, node)) {
				edge = nodeInfo.mostFrequentAttributeValue
			} else {
				edge = nodeInfo.isContinuous ? object[attribute] <= nodeInfo.threshold : object[attribute]
			}

			node = node.getAdjacentNodes().get(edge)
		}

		return { decision, path }
	}

	function getRootNode() {
		return Object.freeze({ ...rootNode })
	}

	function getAllTreeNodes(root) {
		const map = new Map()

		const q = [root]

		for (let len = q.length; len > 0; len = q.length) {
			while (len--) {
				const node = q.shift()
				map.set(node.getId(), node)
				if (node.isLeaf()) continue
				node.getAdjacentNodes().forEach(adjNode => q.push(adjNode))
			}
		}

		return map
	}

	function getTreeNodes() {
		return nodes
	}

	return {
		classify,
		getTreeNodes,
		getRootNode,
	}
}
module.exports = createId3Classifier
