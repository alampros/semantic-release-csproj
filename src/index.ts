import fsAll from 'fs'
import path from 'path'

import xml2js from 'xml2js'

const fs = fsAll.promises

type TPluginConfig = {
  projectFile: string
}
type TSemRelContext = {
  cwd: string
  nextRelease: {
    version: string
  }
}
type TCSProjFileJSON = {
  Project: {
    PropertyGroup?: Array<{ Version?: string }>
    ItemGroup?: Array<any>
  }
}

export async function verifyConditions(pluginConfig: TPluginConfig, context: TSemRelContext) {
  const { projectFile } = pluginConfig
  if(!projectFile) {
    throw new Error('You must specify a projectFile option')
  }
  const { cwd } = context
  const csprojFilePath = path.resolve(cwd, projectFile)
  await fs.readFile(csprojFilePath, 'utf-8')
}

export async function prepare(pluginConfig: TPluginConfig, context: TSemRelContext) {
  const { projectFile } = pluginConfig
  const { cwd, nextRelease } = context
  const parser = new xml2js.Parser()
  const csprojFilePath = path.resolve(cwd, projectFile)
  const csprojContents = await fs.readFile(csprojFilePath, 'utf-8')
  const d = await parser.parseStringPromise(csprojContents) as TCSProjFileJSON
  const modified = await modifyVersionNode(d, nextRelease.version)
  const builder = new xml2js.Builder()
  const xml = builder.buildObject(modified)
  await fs.writeFile(csprojFilePath, xml)
}

async function modifyVersionNode(xmlDoc: TCSProjFileJSON, nextVersion: string): Promise<TCSProjFileJSON> {
  const versionNode = xmlDoc.Project.PropertyGroup.find(pg => Object.prototype.hasOwnProperty.call(pg, 'Version'))
  if(versionNode) {
    versionNode.Version = nextVersion
  } else {
    xmlDoc.Project.PropertyGroup.push({ Version: nextVersion })
  }
  return xmlDoc
}
