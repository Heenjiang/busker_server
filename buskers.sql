/*
 Navicat Premium Data Transfer

 Source Server         : HOEN
 Source Server Type    : MySQL
 Source Server Version : 80015
 Source Host           : localhost:3306
 Source Schema         : buskers

 Target Server Type    : MySQL
 Target Server Version : 80015
 File Encoding         : 65001

 Date: 28/01/2020 12:01:40
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for busker
-- ----------------------------
DROP TABLE IF EXISTS `busker`;
CREATE TABLE `busker`  (
  `busker_id` int(255) NOT NULL COMMENT '关联到user表',
  `nick_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'busker\'s nickname',
  `date_of_birth` timestamp(0) NOT NULL COMMENT 'busker\'s date of birth',
  `instruments` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'what kinds of instucments that the busker could perfome',
  `introduction` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'The introduction of the busker',
  `sex` int(255) NOT NULL COMMENT '1 male 2 female',
  `status` int(255) NOT NULL,
  INDEX `id_busker`(`busker_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of busker
-- ----------------------------
INSERT INTO `busker` VALUES (1, 'DongYe Song', '1987-07-04 00:00:00', 'Guitar', 'Song Dongye, born on November 10, 1987 in Beijing, China, is a Chinese singer and music creator.\nIn 2009, in the face of an independent musician, Douban launched songs such as \"Catch the Fat Man\", \"Year of the Year\", \"Hi, Pants\". In 2011, Song Dongye launched the song \"Anhe Bridge\" and \"Not far from 2013\".', 1, 1);
INSERT INTO `busker` VALUES (2, 'YiTai Wang', '1997-05-13 00:00:00', 'B-Box', 'Wang Yitai, also known as Wang Xinghuo, said in China that he sang a male singer.\nIn 2015, the first personal mixing tape \"Ready To Flow Mixtape\" was launched, which officially entered the entertainment circle. In 2016, the second personal mixing tape \"Flash mixtape\" was released [1]. In 2018, the third personal mixing tape \"Feel & Sight\" was launched. In the same year, he participated in the iQiyi singing and talent show \"China New Rap\", which was eliminated in the National Finals 6 to 4 [2]. On January 20th, 2019, he won the \"New Year\'s Award\" in the \"Hardland Furnace Night · 2018 Netease Cloud Music Original Festival\", and his song \"Don\'t Keep Eyes\" won the annual Top Ten Song Awards [3].', 1, 1);
INSERT INTO `busker` VALUES (3, 'Jonathan Lee', '1998-07-05 00:00:00', 'Guitar', 'Jonathan Lee, born July 19, 1958 in Taipei, Taiwan, China, Taiwanese singer and music producer.\nIn 1980, Li Zongsheng entered the music scene and joined Polaroid Records as a member of the \"Guitar Guitar Choir\" to produce \"The Complete Works of Acoustic Guitars.\" In 1982, he officially entered the record industry and produced Zheng Yi, \"It’s Time for Xiao Yu.\" In 1985, he signed a contract with Rolling Stone Records. In 1986, the first solo album \"The Elf in Life\" was published.', 1, 1);

-- ----------------------------
-- Table structure for image
-- ----------------------------
DROP TABLE IF EXISTS `image`;
CREATE TABLE `image`  (
  `image_id` int(255) NOT NULL AUTO_INCREMENT,
  `path` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'image path',
  `type` int(255) NOT NULL COMMENT '1代表icon, 2 代表poster, 3 代表moments',
  PRIMARY KEY (`image_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of image
-- ----------------------------
INSERT INTO `image` VALUES (1, '/public/images/icon/default.jpg', 1);
INSERT INTO `image` VALUES (2, '/public/images/poster/poster_default.jpg', 2);
INSERT INTO `image` VALUES (3, '/public/images/icon/2019-05-17-23-50-32-816.jpg', 1);
INSERT INTO `image` VALUES (4, '/public/images/moments/1558127215964.jpg', 3);
INSERT INTO `image` VALUES (5, '/public/images/moments/1558127265787.jpg', 3);
INSERT INTO `image` VALUES (6, '/public/images/moments/1558127274837.jpg', 3);
INSERT INTO `image` VALUES (7, '/public/images/poster/2019-05-18-0-11-27-929.jpg', 2);
INSERT INTO `image` VALUES (8, '/public/images/icon/2019-05-18-0-15-5-587.jpg', 1);
INSERT INTO `image` VALUES (9, '/public/images/poster/2019-05-18-0-17-9-491.jpg', 2);
INSERT INTO `image` VALUES (10, '/public/images/moments/1558127976963.jpg', 3);
INSERT INTO `image` VALUES (11, '/public/images/moments/1558128020491.jpg', 3);
INSERT INTO `image` VALUES (12, '/public/images/poster/2019-05-18-0-21-20-35.jpg', 2);
INSERT INTO `image` VALUES (13, '/public/images/icon/2019-05-18-0-26-56-180.jpg', 1);
INSERT INTO `image` VALUES (14, '/public/images/icon/2019-05-18-0-31-56-454.jpg', 1);
INSERT INTO `image` VALUES (15, '/public/images/poster/2019-05-18-0-33-27-321.jpg', 2);
INSERT INTO `image` VALUES (16, '/public/images/poster/2019-05-18-0-35-7-347.jpg', 2);
INSERT INTO `image` VALUES (17, '/public/images/poster/2019-05-18-0-35-59-66.jpg', 2);
INSERT INTO `image` VALUES (18, '/public/images/poster/2019-05-18-0-36-49-170.jpg', 2);

-- ----------------------------
-- Table structure for moment_image
-- ----------------------------
DROP TABLE IF EXISTS `moment_image`;
CREATE TABLE `moment_image`  (
  `moment_id` int(255) NOT NULL,
  `image_id` int(255) NOT NULL,
  `image_moment_id` int(255) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`image_moment_id`) USING BTREE,
  INDEX `moment_id`(`moment_id`) USING BTREE,
  INDEX `image_id`(`image_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of moment_image
-- ----------------------------
INSERT INTO `moment_image` VALUES (1, 4, 1);
INSERT INTO `moment_image` VALUES (1, 5, 2);
INSERT INTO `moment_image` VALUES (1, 6, 3);
INSERT INTO `moment_image` VALUES (2, 10, 4);
INSERT INTO `moment_image` VALUES (2, 11, 5);

-- ----------------------------
-- Table structure for moments
-- ----------------------------
DROP TABLE IF EXISTS `moments`;
CREATE TABLE `moments`  (
  `moment_id` int(255) NOT NULL AUTO_INCREMENT COMMENT 'moment 的唯一标识符',
  `busker_id` int(255) NOT NULL COMMENT 'moment 所属的busker',
  `post_time` datetime(0) NOT NULL COMMENT 'the publish time of the moments',
  `content` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'the content of the moments',
  `status` int(255) NOT NULL COMMENT 'Whether to pass the review',
  `tendency` int(255) NULL DEFAULT NULL COMMENT 'the tendency value of moments',
  `address` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`moment_id`) USING BTREE,
  INDEX `user_moments`(`busker_id`) USING BTREE,
  CONSTRAINT `user_moments` FOREIGN KEY (`busker_id`) REFERENCES `busker` (`busker_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of moments
-- ----------------------------
INSERT INTO `moments` VALUES (1, 1, '2019-06-20 05:03:40', 'In 2012, he signed the modern sky, and the single \"Miss Dong\" was included in the \"Modern Sky 7\" released in December 2012. In August 2013, the album \"Anhe Bridge North\" was released. On December 4, 2013, the album \"Anhe Bridge North\" won the first Lu Xun Culture Award for the annual music award. On August 15, 2014, Song Dongye launched the first official MV \"Zebra, Zebra\"', 1, 642, 'China, ChongQing, YuBei Center Park.');
INSERT INTO `moments` VALUES (2, 2, '2019-05-15 05:19:09', 'One group advances, one of the other players will be eliminated, the system is very cruel, but there is no way, the more difficult it is to get to the back, the masters between the masters, who do not want to be eliminated', 1, 613, 'China. ChongQing. YuBei LongXing HeZe Home');

-- ----------------------------
-- Table structure for trail_notice
-- ----------------------------
DROP TABLE IF EXISTS `trail_notice`;
CREATE TABLE `trail_notice`  (
  `trail_id` int(255) NOT NULL AUTO_INCREMENT COMMENT '演出预告的唯一标识符',
  `busker_id` int(255) NOT NULL COMMENT '发布演出预告的busker',
  `participant` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '参演嘉宾',
  `perform_time` date NOT NULL COMMENT '演出时间',
  `perform_address` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '演出地址',
  `publised_time` date NOT NULL COMMENT '演出预告发布时间',
  `poster` int(255) NULL DEFAULT NULL COMMENT '演出海报',
  `describe` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '演出描述',
  PRIMARY KEY (`trail_id`) USING BTREE,
  INDEX `poster`(`poster`) USING BTREE,
  INDEX `busker`(`busker_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of trail_notice
-- ----------------------------
INSERT INTO `trail_notice` VALUES (1, 1, 'DongYe Song, Di Ma, Thirteen Yao', '2019-06-20', 'China. ChongQing. NanAn DanZiShi JiangBing Road', '2019-05-18', 7, 'In 2012, he signed the modern sky, and the single \"Miss Dong\" was included in the \"Modern Sky 7\" released in December 2012. In August 2013, the album \"Anhe Bridge North\" was released. On December 4, 2013, the album \"Anhe Bridge North\" won the first Lu Xun Culture Award for the annual music award. On August 15, 2014, Song Dongye launched the first official MV \"Zebra, Zebra\"');
INSERT INTO `trail_notice` VALUES (2, 2, 'YiTai Wang, ManSuKe, Gai, Chris Ski', '2019-07-17', 'China BeiJing ChaoYang Opera hall', '2019-05-18', 9, 'In the new issue of \"China\'s New Rap\", the elimination tournament between the teams was launched. It is already in the top 15. Each team has 5 students and 5 students are divided into two groups. Each group performs performances. After the end, the instructor votes. One group advances, one of the other players will be eliminated, the system is very cruel, but there is no way, the more difficult it is to get to the back, the masters between the masters, who do not want to be eliminated');
INSERT INTO `trail_notice` VALUES (3, 2, 'DongYe Song, Di Ma, Thirteen Yao', '2019-07-26', 'China. ChongQing. YuBei LongXing HeZe Home', '2019-05-18', 12, 'No Describe');
INSERT INTO `trail_notice` VALUES (4, 3, 'Li Zongsheng', '2019-05-26', 'Shaoxing | Shaoxing Olympic Sports Center Gymnasium', '2019-05-18', 15, '[Shaoxing] Li Zongsheng 2019 [Year of Songs] Concert Shaoxing Station');
INSERT INTO `trail_notice` VALUES (5, 3, 'Li Zongsheng', '2019-06-14', 'Hohhot | Inner Mongolia Gymnasium', '2019-05-18', 16, '[Hohhot] Li Zongsheng 2019 \"The Year of the Song\" concert Hohhot Station');
INSERT INTO `trail_notice` VALUES (6, 3, 'Li Zongsheng', '2019-06-21', 'Anshan | Anshan Olympic Sports Center Stadium', '2019-05-18', 17, '[Anshan] Li Zongsheng 2019 \"The Year of the Song\" Concert - Anshan Station');
INSERT INTO `trail_notice` VALUES (7, 3, 'Li Zongsheng', '2019-07-07', 'Shenzhen | Shenzhen Universiade Stadium', '2019-05-18', 18, '[Shenzhen] Li Zongsheng 2019 \"The Year of the Song\" Concert - Shenzhen Station');

-- ----------------------------
-- Table structure for type_of_image
-- ----------------------------
DROP TABLE IF EXISTS `type_of_image`;
CREATE TABLE `type_of_image`  (
  `type_id` int(255) NOT NULL,
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of type_of_image
-- ----------------------------
INSERT INTO `type_of_image` VALUES (1, 'icon');
INSERT INTO `type_of_image` VALUES (2, 'poster');
INSERT INTO `type_of_image` VALUES (3, 'moment');

-- ----------------------------
-- Table structure for type_of_user
-- ----------------------------
DROP TABLE IF EXISTS `type_of_user`;
CREATE TABLE `type_of_user`  (
  `type_id` int(255) NOT NULL COMMENT '唯一标识符',
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'user 类型',
  PRIMARY KEY (`type_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of type_of_user
-- ----------------------------
INSERT INTO `type_of_user` VALUES (1, 'busker');
INSERT INTO `type_of_user` VALUES (2, 'admin');
INSERT INTO `type_of_user` VALUES (3, 'unregister');
INSERT INTO `type_of_user` VALUES (4, 'root');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `user_id` int(255) NOT NULL AUTO_INCREMENT COMMENT 'user 的唯一标识符',
  `type_id` int(255) NULL DEFAULT NULL COMMENT 'user 的类型',
  `username` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'user登录的时候的用户名',
  `icon_path` int(255) NULL DEFAULT NULL COMMENT '用户头像',
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'user登录的密码',
  PRIMARY KEY (`user_id`) USING BTREE,
  INDEX `user_type`(`type_id`) USING BTREE,
  CONSTRAINT `user_type` FOREIGN KEY (`type_id`) REFERENCES `type_of_user` (`type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 1, 'songdongye', 3, '123456');
INSERT INTO `user` VALUES (2, 1, 'wangyitai', 8, '123456');
INSERT INTO `user` VALUES (3, 1, 'lizhongsheng', 14, '123456');
INSERT INTO `user` VALUES (4, 2, 'hoen', 1, '123456');
INSERT INTO `user` VALUES (5, 4, 'zoey', 1, '120788');

-- ----------------------------
-- Table structure for video_url
-- ----------------------------
DROP TABLE IF EXISTS `video_url`;
CREATE TABLE `video_url`  (
  `video_id` int(255) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `moment_id` int(11) NOT NULL,
  PRIMARY KEY (`video_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of video_url
-- ----------------------------
INSERT INTO `video_url` VALUES (1, 'RQsM2uvXow8', 1);
INSERT INTO `video_url` VALUES (2, 'WmCpN7h8eo4', 1);
INSERT INTO `video_url` VALUES (3, 'HtRhVYKbILg', 2);
INSERT INTO `video_url` VALUES (4, '-sFCfdHsnYQ', 2);
INSERT INTO `video_url` VALUES (5, 'M4yv3jZVm64', 2);

SET FOREIGN_KEY_CHECKS = 1;
