# Hangman Game

### 文件结构

* `src`目录下，`request`代表封装为`promise`的请求，`utils`下是常用的函数，`words`下是对所有英文单词封装的一些方法。

* 每个文件夹下，`index.js`代表入口文件，其他文件代表相对应的依赖。

* `src`文件夹下的`index.js`定义整个项目的构造函数`Gamer`。在根目录下的`index.js`进行构造调用。

* `words`下封装的方法有：
  * `getWordsByLength`: 根据长度过滤所有单词列表

  * `filterWordsByPosition`: 根据具体的位置的单词信息，过滤一边目标数组

  * `findFrequenceWords`: 遍历目标数组，统计字母频率，并返回字母频率的数组。

  * `filterWordsByWord`: 通过查找是否存在某一个字母，过滤目标数组。

* `request`下封装的方法：
  * `request.js`: 传入对象，通过node发送请求，返回一个Promise

  * `index.js`: 对几个`action`进行封装以及错误重发送，比如遇到`Catch error with socket hang up!`

  * `config.js`: 包含一些配置信息

* 构造函数处理逻辑
  1. 游戏启动后，发送`nextWord`请求，返回目标单词，根据目标单词长度过滤单词列表，并存储目标单词列表。

  2. 在过滤的单词列表中，找到字母出现频率数组。

  3. 取出频率最高的字母，如果存在，则发送`guessWord`。

  4. 如果不存在，则说明未能在字典中查到该词，跳过，进入下一个词。

  5. 如果猜测正确，则根据字母出现位置过滤一遍目标单词列表。重复上述猜词逻辑。

  6. 如果猜测不正确，同样过滤一边目标单词列表，删除有这个词的单词，重复猜词逻辑。

  7. 如果猜测次数达到单个单词上限，则跳过继续下一个词。

### 结果
代码完成后，完整的跑了两次，分数大概在 **1340** 左右，正确率 **77/80** 错误猜测数大概在 **190 ~ 210** 之间。

主要的难度在前期单词长度比较短的情况，目标单词列表过多，例如：

* 目标单词是三个字母，已经猜测出 `*og`

* 由于目前目标单词列表过多，可能有`dog, pog, tog...`，对于短单词的最后一个字母的猜测就相当耗费次数。

长单词出现的问题是有可能不在字典中，直接就会跳过。跳过继续下一个词，这个地方可以进行优化一下，比如此时就可以不根据目标单词列表来猜测，可以根据普遍的字母频率猜测。

还有一个优化的地方可以在缓存，缓存相同单词长度，从字典中第一次过滤出时的目标单词列表，可以在之后的代码中减少执行时间。
