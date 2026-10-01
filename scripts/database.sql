CREATE TABLE `member` (
                          `id` bigint NOT NULL COMMENT '会员标识',
                          `organ_id` bigint NOT NULL COMMENT '机构标识，关联 g2rain_basis.organ.id，会员归属租户',
                          `member_no` varchar(64) COLLATE utf8mb4_0900_as_cs NOT NULL COMMENT '会员编号，机构内唯一，由系统生成',
                          `name` varchar(128) COLLATE utf8mb4_0900_as_cs DEFAULT NULL COMMENT '会员名称',
                          `avatar` varchar(512) COLLATE utf8mb4_0900_as_cs DEFAULT NULL COMMENT '会员头像地址',
                          `mobile` varchar(32) COLLATE utf8mb4_0900_as_cs DEFAULT NULL COMMENT '会员手机号，仅作为资料字段，登录身份以 member_identity 为准',
                          `status` varchar(32) COLLATE utf8mb4_0900_as_cs NOT NULL DEFAULT 'NORMAL' COMMENT '会员状态[NORMAL:正常, FROZEN:冻结]',
                          `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                          `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                          `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
                          `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
                          PRIMARY KEY (`id`),
                          UNIQUE KEY `uk_organ_member_no` (`organ_id`,`member_no`),
                          KEY `idx_organ_status_del` (`organ_id`,`status`,`delete_flag`),
                          KEY `idx_organ_mobile_del` (`organ_id`,`mobile`,`delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs COMMENT='会员表';

CREATE TABLE `member_identity` (
                                   `id` bigint NOT NULL COMMENT '会员身份标识',
                                   `organ_id` bigint NOT NULL COMMENT '机构标识，关联 g2rain_basis.organ.id，身份归属租户',
                                   `member_id` bigint NOT NULL COMMENT '会员标识，关联 member.id',
                                   `identity_type` varchar(32) COLLATE utf8mb4_0900_as_cs NOT NULL COMMENT '身份类型[WECHAT_WORK:企业微信, MOBILE:手机号]',
                                   `identity_value` varchar(256) COLLATE utf8mb4_0900_as_cs NOT NULL COMMENT '身份值；企业微信为 external_userid，手机号为标准化后的手机号',
                                   `verified` tinyint NOT NULL DEFAULT '0' COMMENT '验证标识[0:未验证, 1:已验证]',
                                   `raw_profile` json DEFAULT NULL COMMENT '外部身份原始资料，JSON 格式',
                                   `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                   `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                   `version` int NOT NULL DEFAULT '0' COMMENT '记录版本',
                                   `delete_flag` tinyint NOT NULL DEFAULT '0' COMMENT '删除标识[0:未删除, 1:已删除]',
                                   PRIMARY KEY (`id`),
                                   UNIQUE KEY `uk_organ_identity` (`organ_id`,`identity_type`,`identity_value`),
                                   UNIQUE KEY `uk_organ_member_type` (`organ_id`,`member_id`,`identity_type`),
                                   KEY `idx_organ_member_del` (`organ_id`,`member_id`,`delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs COMMENT='会员身份表';