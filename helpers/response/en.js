
module.exports = {
    respError: {
        DEACTIVATED_USER: "User is deactivated. Kindly activate your account.",
        UNAUTHORIZED: "Not authorized",
        INSUFFICIENT_PERMISSIONS: "Access denied! You don't have enough permissions.",
        VALIDATION_FAILED: "validation failed",
        SERVER: "Internal Error",
        BAD_REQUEST: "Bad Request",
        INVALID_OTP: "OTP is invalid.",
        USER_NOT_EXIST: "User doesn't exist.",
        INVALID_CREDENTIAL: "Please enter valid credentials.",
        INVALID_JWT_TOKEN: "Token is invalid.",
        INVALID_FILE: "File is of not valid type.",
        EMAIL_SENT_SUCCESS: "Email sent successfully.",
        VALID_TOKEN: "Token is valid.",
        NOT_FOUND: "Not Found.",
        USER_NOT_VERIFIED: "User/Account is not verified.",
        USER_DETAILS_FETCHED: "User details fetched successfully.",
        OTP_EXPIRE: "OTP expired.",
        EMAIL_EXIST_ALREADY: "User already exist with this email.",
        MOBILE_EXIST_ALREADY: "User already exist with this mobile number.",
        ALREADY_VERIFIED: "Verified already.",
        DOCUMENT_NOT_EXIST: "Document doesn't exist.",
        LIVESTOCK_NOTFOUND: "Livestock not found.",
        NO_TOKEN: "No token, authorization denied.",
        NO_DATA: "No data available.",
        EQUIPMENT_EXIST_ALREADY: "Equipment already exist.",
        NOT_UNIQUE: "Not unique.",
        NOT_UNIQUE_FARMNAME_AND_REGISTRATIONNO: "Not unique farm name and registration number together.",
        message: {
            COMMUNITY_INVITATION: "You are invited to join the [COMMUNITY_NAME] community. Consider clicking on the link below to proceed. Invite Link: [LINK]",
        },
        EVENT_SDATE: "Start Date is required",
        EVENT_EDATE: "End Date is required",
        EVENT_DATE_FORMAT: "date must be in ",
        EVENT_HEALTH_REC_TENUMBER: "TENumber is required",
        EVENT_HEALTH_REC_ANIMAL: "animals insemination data is required",
        EVENT_HEALTH_REC_ANIMAL_ARRAY: "must be an array",
        EVENT_HEALTH_REC_ANIMAL_NUMBER: "animalNumber is required",
        EVENT_HEALTH_REC_TREATMENT: "treatment is required",
        EVENT_HEALTH_REC_TREATMENT_REASON: "treatmentReason is required",
        EVENT_HEALTH_REC_TREATMENT_DATE: "treatmentDate is required",
        EVENT_HEALTH_REC_DIAGNOSIS: "diagnosis is required",
        EVENT_HEALTH_REC_TREATMENT_DRUGID: "drugId is required",
        EVENT_HEALTH_REC_TREATMENT_DRUGNAME: "drugName is required",
        EVENT_HEALTH_REC_TREATMENT_DRUGWITHDRAWPERIOD: "drugWithdrawPeriod is required",
        EVENT_HEALTH_REC_TREATMENT_ATTENDING: "attendingVeterinarian is required",
        EVENT_HEALTH_REC_TREATMENT_PACKID: "packId is required",
        TASK_START_DATE: "Date must be today or any future date",
        TASK_DUE_DATE: "Date must be same or future date then start date",
        TASK_NAME_REQ: "task name is required",
        TASK_DUE_DATE: "Due Date is required",
        TASK_DESC: "description is required",
        TASK_DESC_PATTERN: "Description should be in string",
        TASK_PRIORITY_REQ: "priority is required",
        INVALID_VALUE: 'Invalid value',
        INVALID_TYPE: 'Invalid type',
        TASK_REPEAT_REQ: 'repeat is required',
        TASK_REPEAT_INTERVAL_REQ: 'repeatsInterval is required',
        TASK_REPEAT_ENDS_REQ: 'repeatEnds is required',
        TASK_REPEAT_FREQ_REQ: 'repeatsFreq is required',
        TASK_DUPLICATE_WEEKDAYS: 'duplicate weekdays',
        TASK_REPEAT_WEEKDAYS: 'repeatWeekDays is required',
        TASK_REPEAT_ENDVAL_REQ: 'repeatEndValue is required',
        TASK_DUPLICATE_ASSIGNEE: 'duplicate assignees',
        TASK_DUPLICATE_LOC: "duplicate locations",
        TASK_DUPLICATE_ANIMAL: 'duplicate animals',
        ANIMAL_NOT_EXIST: 'Animal number doesn\'t exist',
        TASK_NUM_REQ: 'Task number is required',
        TASK_ACTION_REQ: 'action is required',
        TASK_INVALID_VAL: 'Invalid value. Must be ',
        STATE_ID_IS_REQUIRED: 'state id is required',
        COUNTRY_IS_REQUIRED: 'country id is required',
        COUNTRY_CODE_REQUIRED: 'country code is required',
        UIHNUMBER_IS_REQUIRED: 'UIHNumber is required',
        SANUMBER_IS_REQUIRED: 'SANumber is required',
        SIRE_NUMBER_IS_REQUIRED: 'sire number is required',
        CUSTOMER_NAME_IS_REQUIRED: 'customer name is required',
        ANIMAL_NUMBER_IS_REQUIRED: 'animalNumber is required',
        GENOTYPE_ANIMALID_IS_REQUIRED: 'genotypeAnimalId is required',
        TECHNICIAM_NAME_IS_REQUIRED: 'technicianName is required',
        GENOTYPE_DATA_IS_REQUIRED: 'genoTypeData is required',
        GENOTYPE_SERVICE_NOTE_IS_REQUIRED: 'genotypingServiceNote is required',
        NUMBER_OF_SNP_IS_REQUIRED: 'numberOfSNP is required',
        ANIMAL_HEALTH_EXIST: 'Animal health record is registered already',
        ANIMAL_HEALTH_NOT_EXIST: 'Animal health record doesn\'t exist',
        ANIMAL_PERFORMANCE_REGISTERED: 'Animal performance is registered already',
        PROTIEN_YEILD_REQ: 'proteinYield is requied',
        PROTIEN_YEILD_UOM: 'proteinYieldUom is requied',
        MILK_YEILD_REQ: 'milkYield is requied',
        MILK_YEILD_UOM: 'milkYieldUom is requied',
        FAT_YEILD_REQ: 'fatYield is requied',
        FAT_YEILD_UOM: 'fatYieldUom is requied',
        PROTIEN_CONTENT_REQ: 'proteinContent is requied',
        PROTIEN_CONTENT_UOM: 'proteinContentUom is requied',
        FAT_CONTENT_REQ: 'fatContent is requied',
        FAT_CONTENT_UOM: 'fatContentUom is requied',
        MILK_LACTOSE_REQ: 'milkLactose is requied',
        MILK_LACTOSE_UOM: 'milkLactoseUom is requied',
        MILK_UREA_REQ: 'milkUrea is requied',
        MILK_UREA_UOM: 'milkUreaUom is requied',
        LACTATION_NO_REQ: 'lactationNo is requied',
        LAC_LENGTH_REQ: 'lactationLength is requied',
        LAC_LENGTH_UOM: 'lactationLengthUom is requied',
        CURRENT_WEIGHT_REQ: 'currentWeight is requied',
        CURRENT_WEIGHT_UOM: 'currentWeightUom is requied',
        POST_WEANING_GAIN_REQ: 'postWeaningGain is requied',
        POST_WEANING_GAIN_UOM: 'postWeaningGainUom is requied',
        WEANING_WEIGHT_REQ: 'weaningWeight is requied',
        WEANING_WEIGHT_UOM: 'weaningWeightUom is requied',
        AVG_DAILY_GAIN_REQ: 'avgDailyGain is requied',
        AVG_DAILY_GAIN_UOM: 'avgDailyGainUom is requied',
        CARCAS_WEIGHT_REQ: 'carcasWeight is requied',
        CARCAS_WEIGHT_UOM: 'carcasWeightUom is requied',
        WEIGHT_CALV_REQ: 'weightAtCalving is requied',
        WEIGHT_CALV_UOM: 'weightAtCalvingUom is requied',
        YEAR_WEIGHT_REQ: 'yearlingWeight is requied',
        YEAR_WEIGHT_UOM: 'yearlingWeightUom is requied',
        SOMATIC_CELL_REQ: 'somaticCellScore is requied',
        SOMATIC_CELL_UOM: 'somaticCellScoreUom is requied',
        BODY_CONDITION_REQ: 'bodyConditionScore is requied',
        TEST_SCORE_REQ: 'teatScore is requied',
        UDDER_SCORE_REQ: 'udderScore is requied',
        TOTAL_LONGEVITY_REQ: 'totalLongevity is requied',
        DOCILITY_REQ: 'docility is requied',
        AGE_FIRST_CRAVING_REQ: 'ageAtFirstCalving is requied',
        AGE_FIRST_CRAVING_UOM: 'ageAtFirstCalvingUom is requied',
        SCROTAL_CIRCUMFERENCE_REQ: 'scrotalCircumference is requied',
        SCROTAL_CIRCUMFERENCE_UOM: 'scrotalCircumferenceUom is requied',
        ESTRUS_DETECT_REQ: 'estrusDetection is requied',
        PRESENCE_ESTRUS_REQ: 'presenceOfEstrus is requied',
        MATURE_WEIGHT_REQ: 'matureWeight is requied',
        MATURE_WEIGHT_UOM: 'matureWeightUom is requied',
        MATURE_HEIGHT_REQ: 'matureHeight is requied',
        MATURE_HEIGHT_UOM: 'matureHeightUom is requied',
        FOOT_CLAW_REQ: 'footClawSet is requied',
        ARTERIAL_PRESSURE_REQ: 'pulmonaryArterialPressure is requied',
        ARTERIAL_PRESSURE_UOM: 'pulmonaryArterialPressureUom is requied',
        FOOT_ANGLE_REQ: 'footAngle is requied',
        RIB_EYE_AREA_REQ: 'ribEyeArea is requied',
        RIB_EYE_AREA_UOM: 'ribEyeAreaUom is requied',
        ULTRA_SOUND_FAT_REQ: 'ultrasoundFat is requied',
        ULTRA_SOUND_FAT_UOM: 'ultrasoundFatUom is requied',
        ULTRA_SOUND_INTRA_FAT_REQ: 'ultrasoundIntramuscularFat is requied',
        ULTRA_SOUND_INTRA_FAT_UOM: 'ultrasoundIntramuscularFatUom is requied',
        ULTRA_SOUND_RIB_EYE_REQ: 'ultrasoundRibEyeArea is requied',
        ULTRA_SOUND_RIB_EYE_UOM: 'ultrasoundRibEyeAreaUom is requied',
        FAT_THICKNESS_REQ: 'fatThickness is requied',
        FAT_THICKNESS_UOM: 'fatThicknessUom is requied',
        MARBELING_REQ: 'marbling is requied',
        MARBELING_UOM: 'marblingUom is requied',
        DRY_MATTER_INTAKE_REQ: 'dryMatterIntake is requied',
        DRY_MATTER_INTAKE_UOM: 'dryMatterIntakeUom is requied',
        CALVING_INTERNAL_REQ: 'calvingInterval is requied',
        MILK_FREQ_REQ: 'milkingFrequency is requied',
        MILK_FREQ_UOM: 'milkingFrequencyUom is requied',
        FERTILITY_REQ: 'fertility is requied',
        ANIMAL_PERFORMANCE_NOT_EXIST: 'Animal performance data doesn\'t exist for this animal',
        GENDER_REQ: 'gender is required',
        BREED_ID_REQ: 'breedId is required',
        SAMPLE_DATA_REQ: 'sampleDate is required',
        PREP_DATE_REQ: 'preparationDate is required',
        MOTILITY_OPT_ID_REQ: 'sampleMotilityOptId is required',
        NUMBER_OF_STRAWS_REQ: 'numberOfStraws is required',
        LOCATION_ID_REQ: 'locationId is required',
        BATCH_NO_REQ: 'batchNumber is required',
        SAMPLE_CONC_REQ: 'sampleConcentration is required',
        TECHNICAL_NAME_REQ: 'technicalName is required',
        GENE_BANK_NO_REQ: 'geneBankNumber is required',
        CHROMOSOME_REQ: 'chromosome is required',
        SEQ_CHANGE_REQ: 'sequenceChange is required',
        INHERITANCE_REQ: 'inheritance is required',
        DISEASE_NAME_REQ: 'diseaseName is required',
        REF_SEQ_REQ: 'referenceSequence is required',
        PUBMED_REF_REQ: 'pubmedReference is required',
        GT_PERFORMANCE_REQ: 'GTPerformanceNumber is required',
        GENOTYPE_PERFORMANCE_REQ: 'Genotye performance number doesn\'t exist',
        ID_REQ: 'ID is required',
        TOKEN_SLOT_REQ: 'Timeslot is required',
        END_DES_MEAT_REQ: 'End Destination Of Meat is required',
        KILL_QTY_REQ: 'Kill Quantity is required',
        KILL_QTY_UOM: 'Kill Quantity Unit is required',
        HARVESTING_REQ: 'Harvesting is required',
        PLATE_NO_PATTERN: 'Plate Number should be alpha numeric',
        MODEL_PATTERN: "Model should be alpha numeric",
        YEAR_PATTERN: "Year should be in numberic format only",
        ANIMAL_TYPE_PATTERN: "Animal Type Id should be numeric",
        LATITUDE_PATTERN: "latitude should be in float",
        LONGITUDE_PATTERN: "longitude should be in float",
        COMMUNITY_NAME_PATTERN: "Community name must be a string",
        COMMUNITY_NAME_REQ: "Community name is required",
        FARM_NAME_REQ: "Farm name is required",
        INVALID_COMMUNITY_NAME: "Invalid community name",
        INTEGER_PATTERN: "Value must be integer.",
        FARM_OWNER_PATTERN: "Farm ownership type is required.",
        INVALID_OWNERSHIP_PATTERN: "Invalid ownership type",
        FARM_GOAL_PATTERN: "Farming goals are required",
        INVITE_LINK_REQ: "Invite link are required",
        INVITE_LINK_INVALID: "Invalid link",
        SURROGATE_DAM_PUBID_REQ: "surrogateDamPubId is required",
        INVALID_DAM_ID: "Invalid Dam id",
        CONCEPTION_METHOD_REQ: "conceptionMethod is required",
        BREED_REQ: "breed is required",
        ORIGIN_REQ: "origin is required",
        DOB_REQ: "dob is required",
        OPERATOR_REQ: "operator is required",
        ANIMAL_REMOVAL_FARM_REQ: "animalRemovedFarmId is required",
        ANIMAL_REMOVAL_DATE_REQ: "animalRemovalDate is required",
        REMOVED_ANIMAL_DEST_REQ: "removedAnimalDestination is required",
        ANIMAL_REMOVAL_REASON_REQ: "animalRemovalReason is required",
        TRACKING_NUM_REQ: "trackingNumber is required",
        HORN_STATUS_REQ: "hornStatus is required",
        COUNTRY_ID_REQ: "countryId is required",
        USER_NUM_REQ: "user number is required",
        MOB_NO_PATTERN: "mobile should be a number",
        OWNER_ID_REQ: "ownerId is required",
        PACK_BATCH_NO_REQ: "packBatchNumber is required",
        PACK_MANUFACTURED_DATE_REQ: "packManufacturedDate is required",
        PACK_IMORTED_DATE_REQ: "packImportedDate is required",
        VERIFIED_REQ: "verified is required",
        PACK_EXP_DATE_REQ: "PackExpirationDate is required",
        PACK_TOTAL_VOL_REQ: "packTotalVolLeft is required",
        PACK_ORDER_ID_REQ: "packOrderId is required",
        PACK_QTY_ORDER_REQ: "packQtyOrdered is required",
        PACK_PRICE_REQ: "packPrice is required",
        PACK_PRICE_CURRENCY_REQ: "packPriceCurrency is required",
        PACK_PAY_DATE_REQ: "packPayDate is required",
        PACK_SHIPPING_ID_REQ: "packShippingId is required",
        PACK_SHIPPING_DATE_REQ: "packShippingDate is required",
        PACK_ORDER_STATUS_REQ: "packOrderStatus is required",
        SPECIALIST_ID_REQ: "specialistId is required",
        SPECIALIST_NAME_REQ: "specialistName is required",
        SPECIALIST_COMMENT_REQ: "specialistComment is required",
        PACK_RECEPIENT_ANIMAL_ID_REQ: "packRecepientAnimalId is required",
        PACK_RECEPIENT_FARM_ID_REQ: "packRecepientFarmId is required",
        PACK_RECEPIENT_KEEPER_ID_REQ: "packRecepientKeeperId is required",
        PACK_RESERVATION_STATUS_REQ: "packReservationStatus is required",
        PACK_RESERVATION_DATE_REQ: "packReservationDate is required",
        PACK_RESERVATION_TIMEOUT_REQ: "packReservationTimeout is required",
        PACK_RESERVATION_TIMEOUT_DATE_REQ: "packReservationTimeoutDate is required",
        PACK_RESERVED_ANIMAL_ID_REQ: "packReservedByAnimalId is required",
        PACK_RESERVED_FARM_ID_REQ: "packReservedByFarmId is required",
        PACK_RESERVED_KEEPER_ID_REQ: "packReservedBykeeperId is required",
        WAREHOUSE_ID_REQ: "warehouseId is required",
        LOCATION_RACK_ID_REQ: "locationRackId is required",
        LOCATION_TIER_ID_REQ: "locationTierId is required",
        LOCATION_POS_ID_REQ: "locationPositionId is required",
        PACK_STORAGE_TEMP_OPT_ID_REQ: "packStorageTemperatureOptId is required",
        PACK_CONTAINER_FORM_OPT_ID_REQ: "packContainerFormOptId is required",
        PACK_CONSIST_QTY_REQ: "packConsistQty is required",
        PACK_RELEASE_ID_REQ: "packReleaseId is required",
        PACK_RELEASE_DATE_REQ: "packReleaseDate is required",
        INVALID_COL: "col is invalid",
        INVALID_SIRE_ID: "Invalid Sire id",
        MOBILE_NUM_EXIST_ALREADY: "Mobile number already exist",
        INVALID_OPT_FOR: "Invalid option for ",
        INVALID_DRUG_NO: "Invalid drug number",
        EMAIL_EXIST: "Email already exist",

        INSAMINATOR_NUMBER_INVALID: 'inseminatorNumber is required',
        INVALID_LENGTH: 'Invalid lenght.',
        ALPHANUMERIC_VALIDATION: "must be alphanumberic only",
        INSAMINATOR_NUMBER_REQUIRED: 'inseminator name is required',
        INVALID_NAME: 'Invalid Name',
        CONCEPTION_RATE_REQ: 'conceptionRate is required',
        FLOAT_REQ: 'must be a float number',
        DATE_OF_MEASUREMENT_REQ: "dateOfMeasurement is required",
        MATING_DATE_REQ: "matingDate is required",
        INSAMINATOR_NAME_REQ: "inseminatorName is required",
        INSAMINATOR_USERID_REQ: 'inseminatorUserId is required',
        ORG_NAME_REQ: 'orgName is required',
        BREEDER_SERVICE_NO_REQ: 'breedingServiceNo is required',
        CONCEPTION_METHOD_ID_REQ: 'conceptionMethodOptId is required',
        SIRE_ID_REQ: 'sireId is required',
        SURROGATE_DAM_ID_REQ: 'surrogateDamId is required',
        EMBROYO_ORG_NAME_REQ: 'embryoOrgName is required',
        SURROGATE_DAM_BREED_ID_REQ: 'surrogateDamBreedId is required',
        SIRE_BREED_ID_REQ: 'sireBreedId is required',
        PREGNANCY_CHECK_DATE_REQ: 'pregnancyCheckDate is required',
        CONCEPTION_SUCCESS_REQ: 'conceptionSuccess is required',
        PREGNANCY_CHECK_OPR_NAME_REQ: 'pregnancyCheckOperatorName is required',
        PREGNANCY_CHECK_METHOD_REQ: 'pregnancyCheckMethod is required',
        DELIVERY_DATE_REQ: 'deliveryDate is required',
        CALF_ID_REQ: 'calfId is required',
        BIRTH_FARM_REQ: 'birthFarm is required',
        BIRTH_EASE_OPT_ID_REQ: 'birthEaseOptId is required',
        BIRTH_WEIGHT_REQ: 'birthWeight is required',
        BIRTH_WEIGHT_UOM_REQ: 'birthWeightUom is required',
        FEED_NAME_REQ: 'feedName is required',
        NOTE_REQ: 'note is required',
        FEED_QTY_REQ: 'feedQty is required',
        FEED_UOM_REQ: 'feedUom is required',
        FEED_NUMBER_REQ: 'feedNumber is required',
        INVALID_FEED_NUMBER: 'feed number is invalid',
        INVALID_ANIMAL_NUMBER_REQ: 'Invalid animal number',
        DATE_REQ: 'date is required',
        BVMETHOD_REQ: 'BVMethod is required',
        ANIMAL_GENETIC_REQ: 'Animal genetic worth is registered already',
        BVSOFTWARE_REQ: 'BVSoftware is required',
        SCRIPT_PATH_REQ: 'scriptsPath is required',
        DPYB_VALUE_REQ: 'DPYBValue is required',
        DPYB_VALUE_ACCURACY_REQ: 'DPYBValueAccuracy is required',
        DPYB_VALUE_PERCENT_REQ: 'DPYBValuePercent is required',
        DPYB_VALUE_RANK_REQ: 'DPYBValueRank is required',
        EI_REQ: 'EI is required',
        EIACCURACY_REQ: 'EIAccuracy is required',
        EIACCURACY_PERCENT_REQ: 'EIAccuracyPercent is required',
        EIRANK_REQ: 'EIRank is required',
        DPYWIGHT_REQ: 'DPYWight is required',
        DPYWIGHT_UOM_REQ: 'DPYWightUom is required',
        DPYUSED_REQ: 'DPYUsed is required',
        ANIMAL_GENETIC_NA_REQ: 'Animal genetic worth data doesn\'t exist for this animal',
        ROLE_NAME_REQ: 'Role name is required',
        DEPT_NUMB_IS_REQ: 'Department Number is required',
        INVALID_DEPT_NUMB: 'Invalid Department Number',
        STATUS_IS_REQ: 'status is required',
        CATEGORY_ID_IS_REQ: 'category id is required',
        CATEGORY_IS_REQ: 'category is required',
        ANIMAL_UNIQUE_TAG_IS_REQ: 'Animal Unique Tag is required',
        PROD_NUM_IS_REQ: 'productNumber is required',
        NAME_REQ: 'name is required',
        MIDDLE_NAME_REQ: 'middle name is required',
        LAST_NAME_REQ: 'last name is required',
        FARM_NUM_IS_REQ: 'farmNumber is required',
        STOCKUOM_IS_REQ: 'stockUom is required',
        STOCKQTY_IS_REQ: 'stockQty is required',
        PRODUCTION_QTY_IS_REQ: 'productionQty is required',
        PRODUCTION_UOM_IS_REQ: 'productionUom is required',
        PRODUCTION_SCALE_IS_REQ: 'productionScale is required',
        ROLE_ID_REQ: 'roleId is required',
        MODULE_ID_IS_REQ: 'moduleId is required',
        CAN_CREATE_IS_REQ: 'canCreate is required',
        CAN_DEL_IS_REQ: 'canDelete is required',
        MUST_BE_0_OR_1: 'Must be 0 or 1',
        PERMISSION_ARRAY_IS_REQ: 'permission array is required',
        CAN_UPDATE_IS_REQ: 'canUpdate is required',
        CAN_READ_IS_REQ: 'canRead is required',
        ROLE_NUM_IS_REQ: 'role number is required',
        DEPT_ID_IS_REQ: 'departmentId is required',
        OLD_PASSWORD_IS_REQ: 'old password is required',
        NEW_PASSWORD_IS_REQ: 'new password is required',
        CONFIRM_PASSWORD_IS_REQ: 'confirm password is required',
        ORDER_NUM_IS_REQ: 'order number_IS_REQ',
        ADDRESS_IS_REQ: 'address is requried',
        CURRENCY_IS_REQ: 'currency is requried',
        TOTAL_PRICE_IS_REQ: 'totalPrice is requried',
        RECIPIENT_TYPE_IS_REQ: 'recipientType is requried',
        RECIPIENT_NAME_IS_REQ: 'recipientName is requried',
        RECIPIENT_ID_IS_REQ: 'recipientId is requried',
        PRODUCT_QTY_UOM_IS_REQ: 'productQtyUom is requried',
        PRODUCT_QTY_IS_REQ: 'productQty is requried',
        PRODUCT_NUM_IS_REQ: 'productNumber is requried',
        PRODUCT_NAME_IS_REQ: 'productName is requried',
        TRANSACTION_DATE_IS_REQ: 'transactionDate is required',
        TRANSACTION_ID_IS_REQ: 'transactionId is required',
        TITLE_IS_REQ: 'title is required',
        NOTE_NUMBER_IS_REQ: 'noteNumber is required',
        INSEMINATOR_STATISTIC_NO_IS_REQ: 'inseminatorStatisticNo is required',
        OTP_IS_REQ: 'OTP is required',
        OTP_NUM_ONLY: 'OTP should be number only',
        PASSWORD_IS_REQ: 'Password is required',
        CREDENTIAL_IS_REQ: 'Credential is required',
        LAT_IS_REQ: 'Latitude is required',
        LONG_IS_REQ: 'Longitude is required',
        MOB_NUM_IS_REQ: 'Mobile No is required',
        PAGE_IS_REQ: 'Page is required',
        INVALID_PAGE_NUM: 'Invalid page number',
        INVOICE_DATE_IS_REQ: 'Invoice Date is required',
        ORDER_ID_IS_REQ: 'Order Id is required',
        EAD_IS_REQ: 'Estimated Arrival Date is required',
        SHIPMENT_ID_IS_REQ: 'Shipment Id is required',
        PAGE_NO_IS_REQ: 'Page no. is required',
        THIS_FIELD_IS_REQ: 'This field is required',
        FARM_ID_IS_REQ: 'Farm Id is required',
        LIMIT_IS_REQ: 'limit is required',
        INVALID_LIMIT: 'Invalid limit',
        INVALID_ID: 'Invalid id',
        SEGMENT_ID_IS_REQ: 'Segment Id is required',
        SEGMENT_IS_REQ: 'Segment is required',
        FARM_ID_POS_INT: 'Farm Id must be a positive integer',
        GEOFENCE_NAME_STRING: 'Geofence Name must be string',
        POS_INT: 'Must be a postive integer',
        PLANTING_REQ: 'Planting is required',
        SEARCH_VAL_REQ: 'search value is required',
        COL_REQ: 'column is required',
        TRUE_OR_FALSE: 'must be true or false',
        DESC_REQ: 'desc is required',
        YEAR_REQ: 'Year is required',
        CROP_HIST_ARRAY: 'Crop history must be in array',
        FARM_AREA_REQ: 'Farm Area is required',
        VAL_STRING: 'Value must be string',
        INVALID_FARMING_GOAL: 'LAT_IS_REQ',
        BRAND_REQ: 'brand is required',
        TATTOO_IS_REQ: 'tattoo is required',
        PREV_OWNER_NAME_REQ: 'previousOwnerName is required',
        TWIN_IS_REQ: 'twin is required',
        BREED_ASSOCIATION_NAME_REQ: 'breedAssociationName is required',
        BREED_ASSOCIATION_REG_NO_REQ: 'breedAssociationRegNo is required',
        BREEDER_IS_REQ: 'breeder is required',
        STEER_IS_REQ: 'steer is required',
        EMAIL_IS_REQ: 'email is required',
        INVALID_EMAIL: 'not a valid email',
        DEPT_REQ: 'department is required',
        DEPT_NAME_REQ: 'department name is required',
        DEPT_ALREADY_EXIST: 'department with name already exist',
        ROLE_IS_REQ: 'role is required',
        INVALID_MOB_NO: 'invalid mobile number',
        TAG_TYPE_IS_REQ: 'tagType is required',
        TAG_NUM_IS_REQ: 'tagNumber is required',
        FARM_NUMB_IS_REQ: 'farm number is required',
        REG_NUM_IS_REQ: 'registrationNumber is required',
        BIRTH_EASE_REQ: 'birthEase is required',
        BIRTH_FARM_ID_REQ: 'birthFarmId is required',
        OWNER_NAME_REQ: 'ownerName is required',
        OWNER_USER_NANME_REQ: 'owner user number is required',
        SIRE_PUBID_REQ: 'sirePubId is required',
        DAM_PUBID_REQ: 'damPubId is required',
        MUST_BE_A_NUM: "Must be a number",
        PAGE_NUM_IS_REQ: 'page number is required',
        DRUG_NUM_REQ: 'drugNumber is required',
        GENERIC_NAME_REQ: 'genericName is required',
        ACTIVE_INGREDIENT_REQ: 'activeIngredients is required',
        DISTRIBUTOR_REQ: 'distributor is required',

        REG_DATE_REQ: 'registrationDate is required',
        MANUFACTURE_REQ: 'manufacturer is required',
        SUBSTITUTE_DRUG_NO_REQ: 'substituteDrugNo is required',
        ROLE_NAME_ALREADY_EXIST: 'Role name already exist',
        INVALID_ROLE_NUMBER: 'Invalid role number',
        INVALID_SANUMBER: 'invalid SANumber',
        INVALID_UIHNUMBER: 'invalid UIHNumber',
        NO_NOTE_FOUND_FOR_THE_ANIMAL: "no note found for the animal",
        INVALID_NOTE_NUMBER:"invalid note number",
        PRODUCT_ALREADY_EXIST_IN_THE_FARM:"Product already exist in the farm",
        PRODUCT_NUMBER_IS_INVALID:'Product number is invalid',



    }
}