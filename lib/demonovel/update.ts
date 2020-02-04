/**
 * Created by user on 2020/2/3.
 */

import Bluebird from 'bluebird';
import { stat, readJSON, outputJSON } from 'fs-extra';
import fetch from 'cross-fetch';
import { INovelStatCache } from '@node-novel/cache-loader';
import { getLocalFilename } from './load';
import buildCache from './build';

let url = `https://gitlab.com/novel-group/txt-source/raw/master/novel-stat.json`;

export async function updateCache()
{
	let localFile = getLocalFilename();

	return Bluebird.resolve(stat(localFile))
		.then<INovelStatCache>(async (st) => {
			if (st && (Date.now() - st.mtimeMs) < 86400 * 1000)
			{
				return readJSON(localFile)
			}
			return Promise.reject()
		})
		.catch(e => fetchCache())
		.catch<INovelStatCache>(e => {
			console.warn(e.message);
			return readJSON(localFile)
		})
		.tap(data => outputJSON(localFile, data, { spaces: 2 }))
		.tap(v => buildCache())
		;
}

function fetchCache()
{
	return Bluebird
		.resolve(fetch(url))
		.then<INovelStatCache>(v => {
			return v.json()
		})
		;
}

export default updateCache
