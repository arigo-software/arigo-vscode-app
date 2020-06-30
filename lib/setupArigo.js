const fs = require('fs').promises;
const path = require('path');

const isWin = !!process.platform.match(/^win/);

const targetConfigFileName = 'target.json';
async function setupArigo(installDir){
	await ensureTargetConfig(installDir);
	await installBinary(installDir);
}

async function ensureTargetConfig(installDir){
	try{
		await fs.access(`${installDir}/.vscode/${targetConfigFileName}`);
	}catch(err){
		await fs.copyFile(__dirname + `/../files/${targetConfigFileName}`, `${installDir}/.vscode/${targetConfigFileName}`);
	}
}

async function installBinary(installDir){
	let target = process.cwd() + '/bin/arigo.js';
	let src = `${installDir}/node_modules/.bin/arigo`;
	let relativePath = path.relative(path.dirname(src),target);
	if (isWin) await installWindowsBinaries(relativePath, src);
	else await setBinaryLink(relativePath, src);
}
async function setBinaryLink(relativePath, src){
	try{
		await fs.symlink(relativePath, src);
	}catch(err){}
}

async function installWindowsBinaries(relativePath, src){
	await installShell(relativePath, src);
	await installCommandLine(relativePath, src);
	await installPowershell(relativePath, src);
}

async function installShell(relativePath, src){
	let shellScript =
'#!/bin/sh\r\n' +
`basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")\r\n` +
'\r\n' +
'case `uname` in\r\n' +
'    *CYGWIN*|*MINGW*|*MSYS*) basedir=`cygpath -w "$basedir"`;;\r\n' +
'esac\r\n' +
'\r\n' +
'if [ -x "$basedir/node" ]; then\r\n' +
`  "$basedir/node"  "$basedir/${relativePath}" "$@"\r\n` +
'  ret=$?\r\n' +
'else\r\n' +
`  node  "$basedir/${relativePath}" "$@"\r\n` +
'  ret=$?\r\n' +
'fi\r\n' +
'exit $ret\r\n';
	await fs.writeFile(src, shellScript,"utf8");
}

async function installCommandLine(relativePath, src){
	relativePath = relativePath.replace(/\//g,"\\");
	let cmdScript =
'@ECHO off\r\n' +
'SETLOCAL\r\n' +
'CALL :find_dp0\r\n' +
'\r\n' +
'IF EXIST "%dp0%\node.exe" (\r\n' +
'  SET "_prog=%dp0%\node.exe"\r\n' +
') ELSE (\r\n' +
'  SET "_prog=node"\r\n' +
'  SET PATHEXT=%PATHEXT:;.JS;=;%\r\n' +
')\r\n' +
'\r\n' +
`"%_prog%"  "%dp0%\${relativePath}" %*\r\n` +
'ENDLOCAL\r\n' +
'EXIT /b %errorlevel%\r\n' +
':find_dp0\r\n' +
'SET dp0=%~dp0\r\n' +
'EXIT /b\r\n';
	await fs.writeFile(src + '.cmd', cmdScript,"utf8");
}

async function installPowershell(relativePath, src){
	let ps1Script =
'#!/usr/bin/env pwsh\r\n' +
'$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\r\n' +
'\r\n' +
'$exe=""\r\n' +
'if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\r\n' +
'  # Fix case when both the Windows and Linux builds of Node\r\n' +
'  # are installed in the same directory\r\n' +
'  $exe=".exe"\r\n' +
'}\r\n' +
'$ret=0\r\n' +
'if (Test-Path "$basedir/node$exe") {\r\n' +
`  & "$basedir/node$exe"  "$basedir/${relativePath}" $args\r\n` +
'  $ret=$LASTEXITCODE\r\n' +
'} else {\r\n' +
`  & "node$exe"  "$basedir/${relativePath}" $args\r\n` +
'  $ret=$LASTEXITCODE\r\n' +
'}\r\n' +
'exit $ret\r\n';
	await fs.writeFile(src + '.ps1', ps1Script,"utf8");
}

module.exports = setupArigo;
