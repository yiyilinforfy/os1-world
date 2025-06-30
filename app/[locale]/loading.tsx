<template>
  <div class="app-container">
    <el-row>
      <el-col>
        <div class="container-header-area">
          <div>
            <el-form
              :inline="true"
            >
              <el-form-item>
                <el-input
                  v-model="searchServiceKeyWord"
                  :placeholder="$t('containerPage.searchInputHolder')"
                  style="width: 330px;"
                  class="filter-item"
                  :disabled="uploading"
                  :clearable="true"
                  @keyup.enter.native="searchService(searchServiceKeyWord)"
                >
                  <el-select
                    slot="prepend"
                    v-model="searchCriteria"
                    style="width: 100px;"
                    @change="searchService"
                  >
                    <el-option
                      v-for="option in searchCriteriaOption"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-input>

              </el-form-item>

              <el-form-item>
                <el-button
                  :loading="uploading"
                  class="service-refresh-button"
                  icon="el-icon-refresh"
                  type="text"
                  plain
                  @click="refreshAll"
                >
                  {{ $t('button.refreshButton') }}
                </el-button>
              </el-form-item>

              <el-form-item>
                <el-popover
                  placement="bottom"
                  width="330"
                  trigger="click"
                >
                  <div class="import-secret-tip">
                    <div class="import-header-title">
                      {{ $t('containerPage.secretInputHolder') }}
                    </div>
                    <el-input
                      v-model="secretStr"
                      type="textarea"
                      resize="none"
                      :rows="5"
                      style="width:100%;"
                      @keyup.enter.native="addPodSecret"
                    />
                  </div>
                  <div class="token-panel-btn-area">
                    <el-button
                      type="text"
                      size="mini"
                      class="secret-clear-button"
                      @click="clearSecretStr"
                    >
                      {{ $t('button.clearButton') }}
                    </el-button>
                    <el-button
                      plain
                      round
                      size="mini"
                      @click="addPodSecret"
                    >
                      {{ $t('button.confirmButton') }}
                    </el-button>
                  </div>

                  <el-button
                    slot="reference"
                    :loading="uploading"
                    class="filter-item"
                    type="primary"
                    plain
                    icon="el-icon-download"
                  >
                    {{ $t('button.importButton') }}
                  </el-button>
                </el-popover>
                <el-dropdown
                  trigger="click"
                  @command="clickManageDropdown"
                >
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      command="imagehub"
                      icon="el-icon-menu"
                    >
                      {{ $t('button.imageHubButton') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      command="synchronize"
                      icon="el-icon-upload"
                    >
                      {{ $t('button.synchronizeButton') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>

                  <el-button
                    type="primary"
                    icon="el-icon-more-outline"
                    :loading="uploading || syncLoading"
                    style="margin-left: 10px;color: #fff;"
                  >
                    {{ syncLoading ? $t('containerPage.secretsSyncing') : $t('button.manageButton') }}
                  </el-button>
                </el-dropdown>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-col>
      <el-col>
        <el-tabs
          v-model="filterCondition"
          type="border-card"
        >
          <el-tab-pane
            v-for="item in statusOptions"
            :key="item.label"
            :label="item.label"
            :name="item.value"
          >
            <el-table
              ref="podTable"
              border
              :data="displayPods"
              class="data-list-table"
              :row-class-name="importedServiceRow"
              :row-key="getRowKeys"
              :expand-row-keys="expandedRowID"
              @expand-change="expandChange"
              @selection-change="handleSelectionChange"
            >
              <span slot="empty">
                <el-empty
                  :description="emptyDescription"
                />
              </span>
              <el-table-column type="expand">
                <template slot-scope="props">
                  <el-result
                    v-if="showTokenErrorExpand.includes(props.row.status)"
                    style="padding: 10px"
                  >
                    <template slot="icon">
                      <svg-icon
                        icon-class="token-invalid"
                        style="font-size: 5.4em;"
                      />
                    </template>
                    <span
                      slot="title"
                      class="token-error-expand-title"
                    >
                      {{ $t('containerPage.tokenExpandText.title') +' -> '+ props.row.message }}
                    </span>
                    <span
                      slot="subTitle"
                      class="token-error-expand-text"
                    >
                      <template v-if="props.row.code !== 433">
                        {{ $t('containerPage.tokenExpandText.para1') }}
                        <el-popover
                          placement="top"
                          width="300"
                          trigger="click"
                        >
                          <div class="import-secret-tip">
                            <el-input
                              v-model="replaceSecretStr[props.row.id]"
                              type="textarea"
                              resize="none"
                              :rows="4"
                              :placeholder="$t('containerPage.tokenExpandText.tokenPlaceHolder')"
                              style="width:100%;"
                            />
                          </div>
                          <div class="token-panel-btn-area">
                            <el-button
                              type="text"
                              size="mini"
                              @click="clearReplaceSecretStr(props.row.id)"
                            >
                              {{ $t('button.clearButton') }}
                            </el-button>
                            <el-button
                              round
                              type="primary"
                              size="mini"
                              @click="replacePodSecret(props.row.id)"
                            >
                              {{ $t('button.resetButton') }}
                            </el-button>
                          </div>

                          <span
                            slot="reference"
                            class="token-replace-btn"
                          >
                            {{ $t('containerPage.tokenExpandText.button') }}
                          </span>
                        </el-popover>
                        {{ $t('containerPage.tokenExpandText.para2') }}
                        <br>
                        {{ $t('containerPage.tokenExpandText.para3') }}
                      </template>

                      <template v-else>
                        {{ $t('containerPage.tokenExpandText.tokenDeletePara1') }}
                      </template>

                      <el-popover
                        placement="bottom"
                        :title="$t('containerPage.tokenExpandText.note')"
                        width="340"
                        trigger="click"
                      >
                        <div class="justified-text">
                          {{ $t('containerPage.tokenExpandText.helpInfo1') }}
                          <br>
                          <br>
                          {{ $t('containerPage.tokenExpandText.helpInfo2') }}
                          <br>
                          {{ $t('containerPage.tokenExpandText.helpInfo3') }}

                        </div>
                        <span
                          slot="reference"
                          style="cursor: pointer;"
                        >
                          <i
                            class="el-icon-question"
                            style="color: coral;"
                          />
                        </span>
                      </el-popover>

                      <div class="token-error-expand-id">
                        <strong>
                          {{ $t('containerPage.tokenExpandText.serviceID') }}
                        </strong>
                        : {{ props.row.id }}
                        <i
                          class="el-icon-document-copy"
                          style="margin-left: 6px;cursor: pointer;"
                          @click="handleClipboard(props.row.id, $event)"
                        />
                        <br>
                        <strong>
                          {{ $t('containerPage.tokenExpandText.tokenID') }}
                        </strong>
                        : {{ props.row.token }}
                        <i
                          class="el-icon-document-copy"
                          style="margin-left: 6px;cursor: pointer;"
                          @click="handleClipboard(props.row.token, $event)"
                        />
                      </div>
                    </span>
                  </el-result>
                  <el-form
                    v-else
                    label-position="left"
                    inline
                    class="demo-table-expand"
                    style="margin-left: 92px"
                  >
                    <el-form-item
                      :label="$t('tableExpandLabel.serviceType')"
                    >
                      <span>
                        {{ props.row.serviceID }}
                        <i
                          class="el-icon-document-copy"
                          style="margin-left: 6px;cursor: pointer;"
                          @click="handleClipboard(props.row.serviceID, $event)"
                        />
                      </span>
                    </el-form-item>
                    <el-form-item
                      :label="$t('tableExpandLabel.serviceName')"
                    >
                      <span>{{ props.row.service }}</span>
                    </el-form-item>
                    <el-form-item
                      :label="$t('tableExpandLabel.createdTime')"
                    >
                      <span>{{ props.row.createdAt | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
                    </el-form-item>
                    <el-form-item
                      :label="$t('tableExpandLabel.duration')"
                    >
                      <span>{{ props.row.duration }}h</span>

                      <span
                        v-if="!['ServiceAbort','ServiceDone','ServicePending'].includes(props.row.status)"
                        class="service-remain-time"
                      >
                        ( {{ $t('containerPage.serviceRemainPrompt') +' '+ getLeftTime(progressPercentages[props.row.id], props.row.duration) }} )
                      </span>

                    </el-form-item>

                    <el-form-item
                      :label="$t('containerTableLabel.endTime')"
                    >

                      <span>
                        {{ props.row.endAt | parseTime("{y}-{m}-{d} {h}:{i}") }}
                      </span>

                    </el-form-item>

                    <el-form-item
                      :label="$t('containerTableLabel.lastUpdate')"
                    >
                      <span>
                        {{ props.row.updatedAt | parseTime("{y}-{m}-{d} {h}:{i}") }}
                      </span>

                    </el-form-item>

                    <el-form-item
                      :label="$t('tableExpandLabel.address')"
                    >
                      <span>
                        {{ props.row.address }}
                        <i
                          class="el-icon-document-copy"
                          style="margin-left: 6px;cursor: pointer;"
                          @click="handleClipboard(props.row.address, $event)"
                        />
                      </span>
                    </el-form-item>
                    <el-form-item
                      :label="$t('tableExpandLabel.recipient')"
                    >
                      <span>
                        {{ props.row.recipient }}
                        <i
                          class="el-icon-document-copy"
                          style="margin-left: 6px;cursor: pointer;"
                          @click="handleClipboard(props.row.recipient, $event)"
                        />
                      </span>
                    </el-form-item>

                    <template v-if="statusInfo[props.row.id] ? statusInfo[props.row.id].podStatus : false">
                      <el-form-item :label="$t('tableExpandLabel.hostIP')">
                        <span>
                          {{ statusInfo[props.row.id].podStatus.hostIP }}
                          <i
                            class="el-icon-document-copy"
                            style="margin-left: 6px;cursor: pointer;"
                            @click="handleClipboard(statusInfo[props.row.id].podStatus.hostIP, $event)"
                          />
                        </span>
                      </el-form-item>
                    </template>

                    <el-form-item
                      :label="$t('tableExpandLabel.notice')"
                    >
                      <span
                        class="el-icon-caret-right"
                        @click="isShowNotice = true;selectedRow = props.row"
                      />

                    </el-form-item>

                    <template v-if="props.row.email">
                      <el-form-item :label="$t('tableExpandLabel.email')">
                        <span>{{ props.row.email }}</span>
                    &nbsp;
                        <el-tooltip
                          placement="top"
                          content="Change binded email"
                        >
                          <i
                            style="cursor: pointer;margin-left: 5px"
                            class="el-icon-edit"
                            @click="openEmailsDialog(props.row)"
                          />
                        </el-tooltip>

                        <el-tooltip
                          placement="top"
                          content="Delete binded email"
                        >
                          <i
                            style="cursor: pointer;margin-left: 5px"
                            class="el-icon-delete"
                            @click="deleteUserServiceContact(props.row.secret, props.row.id)"
                          />

                        </el-tooltip>

                      </el-form-item>
                    </template>

                    <!-- <template v-if="statusInfo[props.row.id].podSpec">
                  <el-form-item :label="$t('tableExpandLabel.containers')">
                    <span
                      class="el-icon-caret-right"
                      @click="openContainersDialog(props.row)"
                    />
                  </el-form-item>
                </template> -->

                    <el-form-item
                      v-if="props.row.lastState"
                      :label="$t('tableExpandLabel.lastState')"
                      style="width: 100%"
                    >
                      <span class="el-icon-caret-bottom" @click="showLastState = !showLastState" />
                    </el-form-item>

                    <el-form-item
                      :label="$t('tableExpandLabel.serviceOptions')"
                      :class="{ expandService: props.row.showOptions }"
                    >
                      <span
                        :class="props.row.showOptions? 'el-icon-caret-bottom':'el-icon-caret-right'"
                        @click="showServiceOptions(props.row)"
                      />
                      <div v-if="props.row.showOptions" class="box">
                        <span>
                          <span class="option-item">
                            {{ $t('serviceOptions.region') }}:
                          </span>
                          {{ props.row.serviceOptions.region }}
                        </span>
                        <br>
                        <span>
                          <span class="option-item">
                            {{ $t('serviceOptions.portNumber') }}:
                          </span>
                          {{ getUnitNum(props.row.serviceOptions.resourceUnit) }}
                        </span>
                        <br>
                        <span>
                          <span class="option-item">
                            {{ $t('serviceOptions.ram') }}:
                          </span>
                          {{ getRam(props.row.serviceOptions.resourceUnit) }}
                        </span>
                        <br>
                        <span>
                          <span class="option-item">
                            {{ $t('serviceOptions.portSpecification') }}:
                          </span>
                          {{ props.row.serviceOptions.portSpecification || "-" }}
                        </span>
                        <br>
                        <span>
                          <span class="option-item">
                            {{ $t('serviceOptions.persistentStorage') }}:
                          </span>
                          {{ props.row.serviceOptions.persistStorage || "-" }}
                        </span>
                      </div>
                    </el-form-item>
                    <el-form-item
                      v-if="['ServiceRunning', 'ServiceStop'].includes(props.row.status)"
                      :class="isDescription[props.$index]?'wrap-form-item':''"
                    >
                      <div slot="label">
                        {{ $t('tableExpandLabel.description') }}

                        <i
                          v-if="props.row.description"
                          class="el-icon-document-copy"
                          style="margin-left: 3px;cursor: pointer;"
                          @click="handleClipboard(props.row.description, $event)"
                        />

                        <i
                          v-if="!isDescription[props.$index]"
                          class="el-icon-edit-outline"
                          style="margin-left: 3px;cursor: pointer;"
                          @click="editDescription(props.$index, props.row.description)"
                        />
                        <!-- <span
                      v-else
                      class="word-length-count"
                    >
                      {{ description[props.$index].length +'/200' }}
                    </span> -->

                      </div>
                      <div
                        v-if="isDescription[props.$index]"
                        style="display: flex;align-items: center;"
                      >
                        <el-input
                          v-model="description[props.$index]"
                          type="textarea"
                          style="width: 300px;"
                          :autosize="{minRows: 1, maxRows: 3}"
                          resize="none"
                          :clearable="true"
                        />
                        <div style="margin-left: 5px">
                          <el-button
                            type="primary"
                            size="mini"
                            :loading="confirmDescriptionLoading"
                            @click="annotation(props.row.secret, {description:description[props.$index]},props.$index,props.row)"
                          >
                            {{ $t('button.confirmButton') }}
                          </el-button>
                          <el-button
                            size="mini"
                            :loading="confirmDescriptionLoading"
                            @click="editDescription(props.$index)"
                          >
                            {{ $t('button.cancelButton') }}
                          </el-button>
                        </div>

                      </div>
                      <div
                        v-else-if="props.row.description"
                        class="expand-form-description"
                      >
                        {{ props.row.description }}

                      </div>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                :label="$t('containerTableLabel.service')"
                prop="id"
                width="265px"
              >
                <template slot-scope="{ row }">
                  <el-tooltip content="View Containers">
                    <svg-icon
                      icon-class="containers"
                      class="container-service-default-icon"
                      :style="{color: containesStatus[row.status] }"
                      @click="openContainersDialog(row)"
                    />
                  </el-tooltip>

                  <div
                    style="cursor: pointer;font-size: 13px;"
                  >
                    <strong>Region:</strong>  {{ row.serviceOptions ? row.serviceOptions.region : '-' }}
                  </div>

                  <div
                    style="cursor: pointer;font-size: 12px;"
                  >
                    <i
                      class="el-icon-back"
                      style="color: #409EFF;margin-right: 5px;cursor: pointer;"
                      @click="goToRenew(row.id)"
                    />
                    <span @click="handleClipboard(row.id, $event)">
                      {{ row.id }}
                    </span>

                  </div>

                </template>
              </el-table-column>

              <el-table-column
                :label="$t('containerTableLabel.containerStatus')"
                align="center"
                show-overflow-tooltip
              >
                <template slot-scope="{ row, $index }">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="$t('containerPage.moreContainerInfo')"
                    placement="right"
                  >
                    <i
                      class="el-icon-info"
                      :style="{color: containesStatus[row.status] }"
                      @click="openStatusDialog(row.id, $index)"
                    />
                  </el-tooltip>
                  <span>{{ getStatus(row.status) }}</span>
                </template>
              </el-table-column>

              <el-table-column
                :label="$t('containerTableLabel.label')"
                show-overflow-tooltip
                prop="description"
                align="center"
              >
                <template slot-scope="scope">
                  <template v-if="['ServiceRunning', 'ServiceStop'].includes(scope.row.status)">
                    <el-popover
                      placement="bottom"
                      width="400"
                      trigger="click"
                    >
                      <div class="edit-label-input">
                        <el-input
                          v-model="customizedLabel[scope.$index]"
                          maxlength="50"
                          show-word-limit
                          @keyup.enter.native="label(scope.row, {customizedLabel:customizedLabel[scope.$index]},scope.$index)"
                        />
                        <el-button
                          style="margin-left: 5px;"
                          type="primary"
                          size="mini"
                          :loading="editLabelLoading"
                          @click="label(scope.row, {customizedLabel:customizedLabel[scope.$index]},scope.$index)"
                        >
                          {{ $t('button.confirmButton') }}
                        </el-button>
                      </div>

                      <i
                        slot="reference"
                        class="el-icon-edit-outline"
                        style="cursor: pointer;"
                        @click="openEditLabelPopover(scope.$index,scope.row.customizedLabel)"
                      />
                    </el-popover>

                    <span
                      style="cursor: pointer;"
                      @click="handleClipboard(scope.row.customizedLabel, $event)"
                    >
                      {{ scope.row.customizedLabel }}
                    </span>
                  </template>

                  <div v-else>-</div>
                </template>
              </el-table-column>

              <!-- 展示上次deploy的更新时间，根据userservice接口的updatedAt字段 -->
              <el-table-column
                :label="$t('containerTableLabel.remainTime')"
                prop="updatedAt"
                align="center"
              >
                <template slot-scope="scope">
                  <div v-if="showRemainStatus.includes(scope.row.status) && progressPercentages[scope.row.id] > 0">

                    <div style="font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                      <el-tooltip
                        :content="getLeftTime(progressPercentages[scope.row.id], scope.row.duration)"
                        placement="top"
                        effect="dark"
                      >
                        <span class="time-left-ellipsis">
                          {{ getLeftTime(progressPercentages[scope.row.id], scope.row.duration, false) }}
                        </span>
                      </el-tooltip>

                      <el-button
                        v-if="isAllowToRenew(scope.row)"
                        type="text"
                        size="mini"
                        class="renew-alert-btn"
                        style="padding: 0; margin: 0;"
                        @click="goToRenew(scope.row.id, true)"
                      >
                        {{ $t('button.goRenewButton') }}
                      </el-button>
                    </div>

                    <el-progress
                      :show-text="false"
                      :percentage="progressPercentages[scope.row.id]"
                      :color="customColors"
                    />
                  </div>
                  <div v-else>-</div>
                </template>

              </el-table-column>
              <el-table-column
                :label="$t('containerTableLabel.endTime')"
                prop="endAt"
                align="center"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.endAt | parseTime("{y}-{m}-{d} {h}:{i}") }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('containerTableLabel.actions')"
                align="center"
              >
                <template slot-scope="{ row, $index }">
                  <i
                    v-if="isRestarting[row.secret]"
                    class="el-icon-loading"
                  />
                  <template v-else>
                    <el-tooltip
                      v-if="row.status === 'ServicePending'"
                      content="Deploy"
                    >
                      <el-button
                        icon="el-icon-set-up"
                        type="text"
                        style="color: #909399"
                        @click="deployPod(row.id, row.secret, row.serviceOptions)"
                      >
                        <!-- Deploy -->
                      </el-button>
                    </el-tooltip>

                    <el-tooltip
                      v-else-if="row.status === 'ServiceRunning'"
                      content="Stop"
                    >
                      <el-button
                        type="text"
                        style="color: #909399"
                        icon="el-icon-video-pause"
                        @click="stop(row.secret)"
                      >
                        <!-- Redeploy -->
                      </el-button>
                    </el-tooltip>

                    <el-tooltip
                      v-else-if="row.status === 'ServiceStop'"
                      content="Start"
                    >

                      <el-button
                        type="text"
                        style="color: #909399"
                        icon="el-icon-video-play"
                        @click="start(row.secret)"
                      >
                        <!-- Start -->
                      </el-button>
                    </el-tooltip>

                    <el-tooltip
                      v-else-if="row.status === 'TokenInactive'"
                      content="Reset token"
                    >
                      <el-button
                        type="text"
                        style="color: #909399"
                        icon="el-icon-key"
                        @click="expandChange(row)"
                      >
                        <!-- Re-Token -->
                      </el-button>
                    </el-tooltip>

                    <!-- <el-button
                  v-else
                  size="mini"
                  @click="deletePod(row.secret, row.id)"
                >
                  Delete
                </el-button> -->
                    <el-dropdown
                      class="hover-effect"
                      placement="bottom"
                      trigger="click"
                    >
                      <template>
                        <!-- <i class="el-icon-more" /> -->
                        <el-button
                          :disabled="!['ServicePending', 'ServiceRunning', 'ServiceStop'].includes(row.status)"
                          style="margin-left: 10px;color: #909399;"
                          icon="el-icon-more"
                          type="text"
                        />
                        <el-dropdown-menu style="color: #909399;">
                          <el-dropdown-item>

                            <!-- <div
                          v-if="row.status === 'ServicePending'"
                          style="color: #1890ff"
                          @click="deployPod(row.id, row.secret, row.serviceOptions)"
                        >
                          {{ $t('containerTableActions.deploy') }}
                        </div> -->

                          </el-dropdown-item>
                          <el-dropdown-item
                            v-if="row.status === 'ServiceRunning'"
                            v-loading="uploading"
                          >

                            <div
                              @click="restart(row.secret)"
                            >
                              <i class="el-icon-refresh" />
                              {{ $t('containerTableActions.restart') }}
                            </div>

                          </el-dropdown-item>

                          <el-dropdown-item
                            v-if="row.status === 'ServiceRunning'"
                            v-loading="uploading"
                          >

                            <div
                              @click="deployPod(row.id, row.secret, row.serviceOptions, row.status)"
                            >
                              <i class="el-icon-set-up" />
                              {{ $t('containerTableActions.redeploy') }}
                              <!-- redeploy -->
                            </div>

                          </el-dropdown-item>

                          <!-- <el-dropdown-item
                        v-if="row.status === 'ServiceStop'"
                        v-loading="uploading"
                      >

                        <div
                          style="color: #67C23A"
                          @click="start(row.secret)"
                        >

                          {{ $t('containerTableActions.start') }}

                        </div>

                      </el-dropdown-item> -->

                          <el-dropdown-item
                            v-if="['ServiceRunning', 'ServiceStop'].includes(row.status)"
                            v-loading="uploading"
                          >

                            <div
                              @click="openContainersDialog(row)"
                            >
                              <i class="el-icon-cpu" />
                              {{ $t('containerTableActions.containers') }}

                            </div>

                          </el-dropdown-item>

                          <el-dropdown-item
                            v-if="['ServiceRunning'].includes(row.status)"
                            v-loading="uploading"
                          >

                            <div
                              @click="openInjectionDialog(row)"
                            >
                              <i class="el-icon-setting" />
                              {{ $t('containerTableActions.injection') }}

                            </div>

                          </el-dropdown-item>

                          <el-dropdown-item
                            v-if="['ServiceRunning', 'ServiceStop'].includes(row.status)"
                            v-loading="uploading"
                          >

                            <div
                              @click="openStatusDialog(row.id, $index)"
                            >
                              <i class="el-icon-top-right" />
                              {{ $t('containerTableActions.podStatus') }}

                            </div>

                          </el-dropdown-item>

                          <el-dropdown-item
                            v-if="['ServiceRunning', 'ServiceStop'].includes(row.status)"
                            v-loading="uploading"
                          >

                            <div
                              @click="isConfig=true;selectedRow = row"
                            >
                              <i class="el-icon-edit" />
                              {{ $t('containerTableActions.config') }}

                            </div>

                          </el-dropdown-item>

                          <!-- <el-dropdown-item
                        v-if="row.status === 'ServiceRunning'"
                        v-loading="uploading"
                      >

                        <div
                          style="color: #ffba00"
                          @click="deployPod(row.id, row.secret, row.serviceOptions, row.status)"
                        >
                          {{ $t('containerTableActions.redeploy') }}

                        </div>

                      </el-dropdown-item> -->

                          <el-dropdown-item v-if="statusInfo[row.id] && statusInfo[row.id].podStatus">
                            <domain-name-dialog
                              :row="row"
                              :selected-index="$index"
                              :status-info="statusInfo"
                              :secret="secret"
                              @updateSecret="updateSecret"
                              @refreshAll="refreshPodAfterOperation"
                              @getPodInfo="getPodInfo"
                            />
                          </el-dropdown-item>

                          <el-dropdown-item
                            v-if="['ServiceRunning', 'ServiceStop', 'ServicePending'].includes(row.status)"
                            v-loading="uploading"
                          >

                            <div
                              @click="isShowService=true;selectedRow = row"
                            >
                              <i class="el-icon-connection" />
                              {{ $t('containerTableActions.alias') }}

                            </div>

                          </el-dropdown-item>

                          <el-dropdown-item
                            v-if="['ServiceRunning', 'ServiceStop', 'ServicePending'].includes(row.status)"
                            v-loading="uploading"
                          >

                            <div
                              @click="isShowPolicy=true;selectedRow = row"
                            >
                              <i class="el-icon-lock" />
                              {{ $t('containerTableActions.policy') }}
                            </div>

                          </el-dropdown-item>

                          <el-dropdown-item
                            v-if="['ServiceRunning', 'ServicePending', 'ServiceStop'].includes(row.status)"
                            v-loading="uploading"
                          >

                            <div
                              @click="openEmailsDialog(row)"
                            >
                              <i class="el-icon-message" />
                              {{ $t('containerTableActions.contact') }}
                            </div>

                          </el-dropdown-item>

                          <!-- <el-dropdown-item>
                        <div
                          style="color: #ff4949"
                          type="danger"
                          size="small"
                          @click="deletePod(row.secret, row.id)"
                        >
                          {{ $t('containerTableActions.delete') }}
                        </div>

                      </el-dropdown-item> -->
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <el-divider direction="vertical" />

                    <el-button
                      type="text"
                      style="color: #909399"
                      icon="el-icon-delete"
                      @click="deletePod(row.secret, row.id)"
                    >
                      <!-- Delete -->
                    </el-button>

                  </template>

                </template>
              </el-table-column>
              <el-table-column align="center" prop="prop" type="selection" />
            </el-table>
            <el-skeleton
              v-if="uploading && pods.length"
              :rows="6"
              animated
            />
          </el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col :span="24" style="margin: 16px 16px 0 0;text-align: right;">
        <!-- <el-button v-if="selectedPods.length>0" icon="el-icon-upload" type="primary" @click="uploadSecrets()">Upload</el-button> -->
        <el-button
          v-if="selectedPods.length>0"
          type="danger"
          icon="el-icon-delete"
          @click="deletePod()"
        >
          {{ $t('containerTableActions.delete') }}
        </el-button>

      </el-col>
    </el-row>
    <config-dialog
      v-if="isConfig"
      :is-config="isConfig"
      :status-info="statusInfo"
      :row="selectedRow"
      @close="closeConfig"
    />
    <service-dialog
      v-if="isShowService"
      :is-show-service="isShowService"
      :row="selectedRow"
      @close="isShowService = $event"
    />
    <policy-dialog
      v-if="isShowPolicy"
      :is-show-policy="isShowPolicy"
      :row="selectedRow"
      @close="isShowPolicy = false"
    />
    <deploy-dialog
      v-if="openDeployDialog"
      :key="clickedPod + 'deploy' + openDeployDialog.toString()"
      :orderid="clickedPod"
      :secret="selectedSecret"
      :is-re-deploy="isReDeploy"
      :service-option="selectedServiceOption"
      :open="openDeployDialog"
      :pods-list="pods"
      @refresh="refreshStatus"
      @close="openDeployDialog = false"
      @emit="deployDialogListener"
    />
    <status-info-dialog
      :statusinfo="selectedStatusInfo"
      :open="openStatusInfoDialog"
      :orderid="clickedPod"
      @emit="statusInfoDialogListener"
    />
    <monitor-dialog
      v-if="isMonitor"
      :visible="isMonitor"
      :params="monitorParams"
      @closeMonitor="()=>isMonitor=false"
    />
    <notice-dialog
      v-if="isShowNotice"
      :is-show-notice="isShowNotice"
      :row="selectedRow"
      @update:isShowNotice="isShowNotice = $event"
    />
    <container-dialog
      v-if="isShowContainers"
      :is-show-containers="isShowContainers"
      :status-info="statusInfo"
      :row="selectedRow"
      @update:isShowContainers="isShowContainers = $event"
    />

    <auth-dialog
      v-if="showIRSetting"
      :show-i-r-setting="showIRSetting"
      @close="showIRSetting = false"
    />
    <emails-dialog
      v-if="openEmails"
      :open-emails="openEmails"
      :row="selectedRow"
      @close="closeEamils"
      @refreshAll="refreshPodAfterOperation"
    />
    <InjectionDialog
      v-if="isOpenInjection"
      :is-open-injection="isOpenInjection"
      :row="selectedRow"
      @close="closeInjection"
    />

  </div>
</template>

<script>
import { mapState } from 'vuex'
import Base58 from 'base-58'
import { Uint8ArrayToString } from '@/utils/stringUtils'
import { showCompleteHour, formatTimeToYMDH } from '@/utils/stringUtils'
// import LogDialog from './components/LogDialog'
import DeployDialog from './components/PodDeploy'
import MonitorDialog from './components/MonitorDialog'
import StatusInfoDialog from './components/StatusInfoDialog'
import NoticeDialog from './components/NoticeDialog'
import ContainerDialog from './components/ContainerDialog'
import ConfigDialog from './components/ConfigDialog'
import DomainNameDialog from './components/DomainNameDialog'
import ServiceDialog from './components/ServiceDialog'
import EmailsDialog from './components/EmailsDialog'
import PolicyDialog from './components/PolicyDialog'
import AuthDialog from './components/AuthDialog'
import InjectionDialog from './components/InjectionDialog.vue'
import { validLabel, validEmpty, validPodDescription } from '@/utils/validate'
import handleClipboard from '@/utils/clipboard'
import { v4 as uuidv4 } from 'uuid'

import {
  deleteUserServiceContact,
  uploadSecrets,
  checkConfig,
  checkSecrets,
  deleteSecrets,
  annotation,
  label,
  stop,
  start
} from '@/api/kube'
import { decryptMagic } from '@/utils/decrypt'
export default {
  name: 'Containers',
  components: {
    DeployDialog,
    StatusInfoDialog,
    MonitorDialog,
    NoticeDialog,
    ContainerDialog,
    EmailsDialog,
    ConfigDialog,
    DomainNameDialog,
    ServiceDialog,
    AuthDialog,
    PolicyDialog,
    InjectionDialog

  },
  data() {
    return {
      selectedRow: {},
      isShowContainers: false,
      isShowService: false,
      isShowPolicy: false,
      statusOptions: this.$t('containerPage.statusOptions'),
      filterCondition: 'All',
      phaseText: this.$t('containerPage.phaseText'),
      ruleForm: {
        image: '',
        domain: '',
        containerPort: 80,
        isEncryByself: false,
        isLetsencrypt: true
      },
      containesStatus: {
        'ServiceRunning': '#67C23A',
        'ServicePending': '#409EFF',
        'ServiceAbort': 'rgb(199.5, 201, 204)',
        'ServiceDone': 'rgb(199.5, 201, 204)',
        'ServiceStop': 'rgb(237.5, 189.9, 118.5)',
        'Deleted': 'rgb(199.5, 201, 204)',
        'TokenExpired': 'rgb(248, 152.1, 152.1)',
        'TokenInactive': 'rgb(248, 152.1, 152.1)',
        'TokenDeleted': 'rgb(248, 152.1, 152.1)'
      },
      vkubeSecrets: [],
      isSyncSerets: false,
      timerConfig: '',
      configContainerName: '',
      environmentContainerName: '',
      configValue: '',
      environmentValue: '',
      showLastState: false,
      clickedPod: '',
      selectedSecret: '',
      logVisible: false,
      isReDeploy: '',
      isConfig: false,
      openDeployDialog: false,
      openStatusInfoDialog: false,
      uploading: false,
      secret: [],
      secretStr: '',
      replaceSecretStr: {},
      secrets: [],
      pods: [],
      statusInfo: [],
      selectedStatusInfo: {},
      selectedServiceOption: {},
      localStorage: window.localStorage,
      isShowContainersID: '',
      isShowNotice: false,
      isAddconfig: false,
      isUpgrade: false,
      showIRSetting: false,
      confirmDescriptionLoading: false,
      editLabelLoading: false,
      tableData: [],
      // 用于sync的分页获取数据，暂定每页获取10
      curPage: 1,
      pageSize: 10,
      total: 0,
      totalPage: 0,
      isRestarting: {},
      serviceID: '',
      configmap: '',
      isCheckConfig: false,
      openEmails: false,
      isMonitor: false,
      containerEnvs: [{ key: '', value: '' }],
      monitorParams: '',
      isDescription: [],
      customizedLabel: [],
      description: [],
      selectedPodIndex: 0,
      selectedPods: [],
      // syncTip: 'Synchronize your local and remote server pods',
      uploadService: [],
      remoteService: [],
      comingService: [],
      syncLoading: false,
      allowStatus: [
        'ServiceRunning',
        'ServicePending',
        'ServiceStop',
        'TokenInactive',
        'TokenExpired',
        'TokenDeleted'
      ],
      // 展示已经imported的service所在的位置
      importedServiceIndex: -1,
      customColors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 }
      ],
      // 存储每个条目的实时百分比
      progressPercentages: {},
      intervalId: null,
      displayPods: [],
      searchServiceKeyWord: '',
      searchCriteria: 'id',
      searchCriteriaOption: this.$t('containerPage.searchCriteriaOption'),
      expandedRowKeys: [], // 用于存储展开行的key
      emptyDescription: '',
      showRemainStatus: [
        'ServiceRunning',
        'ServiceStop'
      ],
      getOrderFunc: 'pod/getBulkOrder',
      invalidTokenPrompt: false,
      invalidTokenService: [],
      addTokenError: {
        411: 'TokenExpired',
        422: 'TokenInactive',
        433: 'TokenDeleted'
      },
      // 返回uuid，用于expand
      getRowKeys: (row) => {
        // console.log(row)
        return row.uuid
      },
      expandedRowID: [],
      showTokenErrorExpand: [
        'TokenExpired',
        'TokenInactive',
        'TokenDeleted'
      ],
      isOpenInjection: false,
      tabMapOptions: [
        {
          label: 'Pedning',
          value: 'OrderPending'
        },
        {
          label: 'Running',
          value: 'OrderRunning'
        },
        {
          label: 'Running',
          value: 'OrderRunning'
        }
      ]
    }
  },
  computed: {
    ...mapState({
      wallets: (state) => state.wallet.wallets,
      currentIndex: (state) => state.wallet.currentIndex
    }),
    apiHost() {
      return `https://north-america.${process.env.NODE_ENV === 'production' ? 'prod' : 'test'}.vkube.vcloud.systems`
    }
    // displayPods() {
    //   // 根据add或者cache的先后排列，因为add或者cache都是从pods尾巴添加，所以直接reverse以确保不改变原先pods/secrets的顺序影响其他地方只起到一个展示的作用
    //   return [...this.pods].reverse()
    // }
  },
  watch: {
    currentIndex() {
      this.refreshAll()
    },
    filterCondition(newVal) {
      this.searchServiceKeyWord = ''
      this.filterByStatus()
    }
  },
  async created() {
    // save encrypted secrets into local storage once tab close or nevigate to other website in same tab
    const jsonStr = await this.$store.dispatch('cache/getLocalStorageCipher', 'secrets')
    if (!jsonStr) return
    const obj = JSON.parse(jsonStr)
    if (obj?.length > 0) {
      for (const secret of obj) {
        await this.getOrderInfo(secret)
      }
    }
    if (!this.pods.length) {
      this.emptyDescription = 'No containers available. Start by importing a service.'
    }

    this.searchService()
    this.startUpdatingProgress()
    this.saveSecrets()
    this.checkInvalidTokenService()
  },

  mounted() {
    if (this.$route.query.secretStr) {
      this.secretStr = this.$route.query.secretStr
    }
  },
  activated() {
    // 检查是否需要刷新
    if (this.$store.state.app.podNeedRefreshing) {
      this.refreshAll() // 重新加载数据
      // 清除查询参数，避免重复刷新
      this.$store.state.app.podNeedRefreshing = false
      this.$router.replace({ ...this.$route, query: {}})
    }
  },

  beforeDestroy() {
    // Notification.closeAll()
    clearInterval(this.intervalId)
  },
  methods: {
    openInjectionDialog(row) {
      this.selectedRow = row
      this.isOpenInjection = true
    },
    closeInjection() {
      this.isOpenInjection = false
    },
    async openContainersDialog(row) {
      if (row.status !== 'ServiceRunning') {
        this.$alert('Only running services allow container access.', 'Warning', {
          confirmButtonText: 'OK'
        })
        return
      }

      try {
        // 每次打开container dialog要刷新状态信息：image变化、port变化等
        await this.getPodInfo(
          row.secret,
          this.pods.findIndex(pod => pod.secret === row.secret)
        )
        this.isShowContainers = true
        this.selectedRow = row
      } catch (error) {
        this.$message.error('Failed to fetch latest service data')
      }
    },

    openEmailsDialog(row) {
      this.openEmails = true
      this.selectedRow = row
    },
    openEditLabelPopover(index, label = '') {
      this.$set(this.customizedLabel, index, label)
    },
    editDescription(index, description = '') {
      this.$set(this.isDescription, index, !this.isDescription[index])
      this.$set(this.description, index, description)
    },
    getSimpleStatus(status) {
      const temp = this.statusOptions.find(item => item.value === status)
      if (temp) {
        return temp.label
      } else {
        return 'Unknown'
      }
    },
    expandChange(row, expandedRows) {
      if (this.expandedRowID.includes(row.uuid)) {
        this.expandedRowID = this.expandedRowID.filter(item => item !== row.uuid)
      } else {
        this.expandedRowID.push(row.uuid)
      }
      // this.expandedRowID.push(row.id)
    },
    isAllowToRenew(row) {
      if (row) {
        return this.progressPercentages[row.id] < 20 && row.address === this.wallets[this.currentIndex].address
      }
      return false
    },
    invalidTokenNotification() {
      const htmlContent = `  
        <div>  
          <p style="font-size: 13px;word-break: keep-all;text-align:left">
            ${this.$t('containerPage.tokenErrorNotice.para1')} 
            <strong style="color: coral;font-size: 18px">
              ${this.invalidTokenService.length} 
            </strong>
            ${this.$t('containerPage.tokenErrorNotice.para2')} 
            <br>
            ${this.$t('containerPage.tokenErrorNotice.para3')} 
          </p>  
        </div>  
      `

      this.$notify({
        title: this.$t('containerPage.tokenErrorNotice.title'),
        dangerouslyUseHTMLString: true,
        message: htmlContent,
        type: 'error',
        position: 'bottom-right',
        duration: 4000
      })
    },

    goToRenew(id, renew = false) {
      this.$router.push({
        path: '/userServices/index',
        query: {
          serviceID: id,
          renew: renew
        }
      })
    },
    handleClipboard: handleClipboard,

    // 根据状态搜索service
    filterByStatus() {
      console.log('filterByStatus', this.filterCondition)
      if (this.filterCondition === 'All') {
        this.displayPods = [...this.pods].reverse()
        return
      }
      this.displayPods = this.pods.filter(item => {
        return item.status === this.filterCondition
      })
    },

    // imagehub和sync放在manage按钮里
    clickManageDropdown(command) {
      if (command === 'imagehub') {
        this.openSetting()
      } else if (command === 'synchronize') {
        this.syncSeretsWithRemote()
      }
    },

    // 根据id搜索service
    searchService() {
      this.searchServiceKeyWord = this.searchServiceKeyWord.trim()
      if (this.searchServiceKeyWord) {
        this.displayPods = this.pods.filter(service => {
          return service[this.searchCriteria].includes(this.searchServiceKeyWord)
        })
      } else {
        this.displayPods = [...this.pods].reverse()
      }
    },

    // 计算剩余时间
    getLeftTime(percentage, duration, completeHour = true) {
      const left = percentage * duration * 0.01
      if (!left) {
        return '-'
      }
      if (completeHour) {
        return showCompleteHour(left)
      } else {
        if (left < 24) {
          return showCompleteHour(left)
        } else {
          return formatTimeToYMDH(left)
        }
      }
    },

    // 计算剩余寿命百分比，用于进度条
    calculateLifetimePercentage(row) {
      const now = Math.floor(Date.now() / 1000)
      const end = row ? row.endAt : 0

      const totalDuration = (row ? row.duration : 1) * 60 * 60
      const remainingTime = end - now

      if (remainingTime < 0) return 0

      const percentage = (remainingTime / totalDuration) * 100
      return parseFloat(Math.max(0, Math.min(percentage, 100)).toFixed(2))
    },
    updateProgress() {
      this.pods.forEach(row => {
        this.$set(this.progressPercentages, row.id, this.calculateLifetimePercentage(row))
      })
    },
    startUpdatingProgress() {
      if (!this.intervalId) {
        this.updateProgress()
      }
      this.intervalId = setInterval(this.updateProgress, 5000) // 每5秒更新一次
    },
    openSetting() {
      this.showIRSetting = true
    },
    handleSelectionChange(val) {
      this.selectedPods = val
    },
    toggleSelection() {
      this.selectedPods = []
    },
    updateSecret(secret) {
      this.secret = secret
    },
    async getRemoteSecrets() {
      let still = true
      let pagination = {}
      this.remoteService = []
      this.curPage = 1
      // 分页查找数据
      while (still) {
        const res = await checkSecrets(this.apiHost, { address: this.wallets[this.currentIndex].address, current: this.curPage, pageSize: this.pageSize })
        res.data?.list.forEach((i) => {
          const temp = decryptMagic(i.magicContent, this.wallets[this.currentIndex].keyPair)
          i.region = temp.region
          i.secret = temp.secret
        })
        // 获取当前分页的信息，判断是否需要继续查找下一页
        pagination = res.data?.pagination
        if (pagination.total <= (pagination.current * pagination.pageSize)) {
          still = false
        }
        this.curPage += 1
        this.remoteService = this.remoteService.concat(res.data?.list)
      }

      // 抽取pods有但远端没有的，待上传
      const remoteIdsSet = new Set(this.remoteService.map(item => item.userServiceID))
      this.uploadService = this.pods.filter(pod => !remoteIdsSet.has(pod.id) && this.allowStatus.includes(pod.status))

      // 抽取本地没有但远端有的，待拉取到本地
      const podIdsSet = new Set(this.pods.map(item => item.id))
      this.comingService = this.remoteService.filter(item => !podIdsSet.has(item.userServiceID))
    },
    async getOrderInfoAndSaveSecrets(temp) {
      await this.getOrderInfo(temp)
      this.saveSecrets()
    },
    async syncSeretsWithRemote() {
      await this.$confirm(
        this.$t('containerPage.synchronizeIntro.para1') + ' ' + this.$t('containerPage.synchronizeIntro.para2'),
        this.$t('containerPage.synchronizeIntro.title'), {
          confirmButtonText: this.$t('button.confirmButton'),
          cancelButtonText: this.$t('button.cancelButton'),
          type: 'success',
          center: true
        })
      this.importedServiceIndex = -1
      try {
        this.syncLoading = true
        await this.getRemoteSecrets()
        if (!this.uploadService.length && !this.comingService.length) {
          this.$message.warning(this.$t('containerPage.prompt.secretsUptodate'))
          return
        }
        // 上传远端没有的本地pod
        if (this.uploadService.length) {
          const newarr = this.uploadService.map((i) => i.secret[2])
          await uploadSecrets(this.apiHost, { secrets: newarr })
        }

        // if (this.comingService.length) {
        //   this.$message.success(this.$t('containerPage.prompt.secretsSync'))
        // }
        // 拉取远端pod到本地
        const jsonStr = await this.$store.dispatch('cache/getLocalStorageCipher', 'secrets')
        let obj = ''
        if (jsonStr) {
          obj = JSON.parse(jsonStr)
        }
        for (const i of this.comingService) {
          const temp = ['https', `//${i.region.toLowerCase().replace(' ', '-')}.${process.env.NODE_ENV === 'production' ? 'prod' : 'test'}.vkube.vcloud.systems`, i.secret]
          // 如果本地有了就不需要再次添加到pod列表和缓存中
          if (obj?.length > 0 && obj.some(i => i[2] === temp[2])) {
            return
          }
          await this.getOrderInfoAndSaveSecrets(temp)
        }
        this.displayPods = [...this.pods].reverse()
        this.$message.success(this.$t('containerPage.prompt.secretsSync'))
      } catch (error) {
        console.log(error)
      } finally {
        this.syncLoading = false
      }
    },
    closeConfig() {
      this.isConfig = false
    },
    closeEamils() {
      this.openEmails = false
    },
    // 单独更新某个 pod，而否refresh all，节省时间
    refreshPodAfterOperation(secret) {
      this.getOrderInfo(secret)
    },
    async uploadSecrets() {
      try {
        await this.$confirm(this.$t('containerPage.confirm.uploadSecret'), 'Warning', {
          confirmButtonText: this.$t('button.okButton'),
          cancelButtonText: this.$t('button.cancelButton'),
          type: 'warning'
        })
        const newarr = this.selectedPods.map((i) => i.secret[2])
        await uploadSecrets(this.apiHost, { secrets: newarr })
        this.$message.success(this.$t('containerPage.prompt.secretsUploaded'))
      } catch (error) {
        console.log(error)
      } finally {
        this.toggleSelection()
      }
    },
    async annotation(secret, data, index, row) {
      if (!validPodDescription(data.description)) {
        return this.$message.error(this.$t('containerPage.prompt.invalidDescription'))
      }
      try {
        this.confirmDescriptionLoading = true
        await annotation(secret, data)
        this.$set(this.isDescription, index, false)
        this.$set(row, 'description', data.description)
      } catch (error) {
        this.$message.error(error)
      } finally {
        this.confirmDescriptionLoading = false
      }
    },
    async label(row, data, index) {
      // if (!validEmpty(data.customizedLabel)) {
      //   return
      // }
      if (!validLabel(data.customizedLabel)) {
        return this.$message.error(this.$t('containerPage.prompt.invalidLabel'))
      }
      try {
        this.editLabelLoading = true
        await label(row.secret, data)
        this.$set(row, 'customizedLabel', data.customizedLabel)
        this.$message.success(this.$t('containerPage.prompt.editLabel'))
      } catch (error) {
        this.$message.error(error)
      } finally {
        this.editLabelLoading = false
      }
    },

    openMonitorDialog(secret, containers, singleContainerName) {
      this.isMonitor = true
      this.monitorParams = { secret, containers, singleContainerName }
    },
    stop(secret) {
      this.$confirm(this.$t('containerPage.confirm.stopService'), 'Notification', {
        confirmButtonText: this.$t('button.confirmButton'),
        cancelButtonText: this.$t('button.cancelButton'),
        type: 'warning'
      }).then(async() => {
        try {
          var res = await stop(secret)
          if (res.data && res.data.status === 'OK') {
            this.$message.success(this.$t('containerPage.prompt.serviceStopped'))
            setTimeout(() => this.refreshPodAfterOperation(secret), 1500)
          }
        } catch (error) {
          console.log(error)
        }
      })
    },
    start(secret) {
      this.$confirm(this.$t('containerPage.confirm.startService'), 'Notification', {
        confirmButtonText: this.$t('button.confirmButton'),
        cancelButtonText: this.$t('button.cancelButton'),
        type: 'warning'
      }).then(async() => {
        try {
          var res = await start(secret)
          if (res.data && res.data.status === 'OK') {
            this.$message.success(this.$t('containerPage.prompt.serviceStarted'))
            setTimeout(() => this.refreshPodAfterOperation(secret), 1500)
          }
        } catch (error) {
          this.$message(error)
        }
      })
    },
    async checkConfig(secret) {
      this.configmap = await checkConfig(secret)
      this.isCheckConfig = true
    },
    openStatusDialog(id) {
      this.openStatusInfoDialog = true
      this.clickedPod = id
      this.selectedStatusInfo = Object.assign({}, this.statusInfo[id])
    },
    refreshStatus(val) {
      // 刷新deploy后的pod
      if (!val) return
      if (val.secret) {
        // 找到刚刚deploy的index，然后更新数据
        const index = this.secrets.indexOf(val.secret)
        this.getOrderInfo(val.secret, index)
      }
    },
    async restart(secret) {
      await this.$confirm(this.$t('containerPage.confirm.restartService'), 'Warning', {
        confirmButtonText: this.$t('button.confirmButton'),
        cancelButtonText: this.$t('button.cancelButton'),
        type: 'warning'
      }).then(async() => {
        this.$set(this.isRestarting, secret, true)

        try {
          await this.$store.dispatch('pod/restart', { secret })
          const res = await this.$store.dispatch(this.getOrderFunc, secret)
          if (res.code === 200) {
            this.getPodInfo(
              secret,
              this.pods.findIndex(pod => pod.secret === secret)
            )
            this.$message.success(this.$t('containerPage.prompt.serviceRestarted'))
          }
        } catch (err) {
          this.$message({
            message: this.$t('containerPage.prompt.orderInfoError'),
            type: 'warning'
          })
        } finally {
          this.isRestarting[secret] = false
        }
      }).catch(() => {})
    },
    getUnitNum(input) {
      if (input === undefined || input === '') return '-'
      const index = input.indexOf('-')
      if (index > 0) return input.substring(0, index)
      return '-'
    },
    getRam(input) {
      const unit = this.getUnitNum(input)
      if (unit === '-') return '-'
      return unit + 'Gi'
    },
    showServiceOptions(row) {
      this.$set(row, 'showOptions', !row.showOptions)
    },
    reformJson(json) {
      return JSON.stringify(json, undefined, 2)
    },
    async deletePod(secret, id) {
      this.importedServiceIndex = -1
      const text = secret ? this.$t('containerPage.confirm.deleteService') : this.$t('containerPage.confirm.deleteSelectedService')
      try {
        await this.$confirm(
          text,
          'Warning',
          {
            confirmButtonText: this.$t('button.confirmButton'),
            cancelButtonText: this.$t('button.cancelButton'),
            type: 'warning'
          }
        )
          .then(async() => {
            if (secret) {
              this.pods.map(async(pod, index) => {
                if (pod.secret === secret) {
                  this.$delete(this.statusInfo, pod.id)
                  this.$delete(this.secrets, index)
                  await this.saveSecrets()
                  this.$delete(this.pods, index)
                  this.$message({
                    type: 'success',
                    message: this.$t('containerPage.prompt.serviceDeleted')
                  })
                }
              })
              await deleteSecrets(this.apiHost, { userServiceIDs: [id] })
            } else {
              const temp = []
              this.selectedPods.forEach(pod => {
                temp.push(pod.secret ? pod.secret[2] : '')
              })
              await deleteSecrets(this.apiHost, { userServiceIDs: this.selectedPods.map(pod => pod.id) })
              this.secrets = this.secrets.filter((item, index) => !temp.includes(item[2]))
              this.saveSecrets()
              this.pods = this.pods.filter((pod, index) => !this.selectedPods.find(item => item.id === pod.id))
              this.$message.success(this.$t('containerPage.prompt.serviceDeleted'))
            }
          })
      } catch (err) {
        // this.$message({
        //   type: 'info',
        //   message: this.$t('containerPage.prompt.deleteCanceled')
        // })
      } finally {
        this.filterByStatus()
        this.toggleSelection()
      }
    },
    async saveSecrets() {
      const jsonStr = JSON.stringify(this.secrets)
      await this.$store.dispatch('cache/setLocalStorageCipher', {
        key: 'secrets',
        content: jsonStr
      })
    },
    importedServiceRow({ row, rowIndex }) {
      // 高亮已经导入的service
      if (rowIndex === this.importedServiceIndex) {
        return 'imported-row'
      }
      return ''
    },
    clearSecretStr() {
      this.secretStr = ''
    },
    clearReplaceSecretStr(serviceID) {
      this.replaceSecretStr[serviceID] = ''
    },
    async replacePodSecret(serviceID) {
      const replaceSecretStr = this.replaceSecretStr[serviceID]?.trim()
      this.importedServiceIndex = -1
      if (!validEmpty(replaceSecretStr)) return
      try {
        var temp = Uint8ArrayToString(Base58.decode(replaceSecretStr)).split(':')
        if (!Array.isArray(temp) || temp.length !== 3) {
          this.$message.error('Error: Wrong token format')
          return
        }
      } catch (error) {
        console.log(error)
        // 出错了就别被存进缓存和获取service信息
        this.$message.error('Error: ' + error)
        return
      }
      this.secret = temp
      const res = await this.getOrderInfo(this.secret, null, true, serviceID)
      if (res) {
        const newarr = [temp[2]]
        uploadSecrets(this.apiHost, { secrets: newarr })
        this.replaceSecretStr[serviceID] = ''
        this.saveSecrets()
        this.filterByStatus()
      }
    },
    async addPodSecret() {
      this.secretStr = this.secretStr.trim()
      this.importedServiceIndex = -1
      // string is not empty and not just whitespace
      if (!validEmpty(this.secretStr)) return
      try {
        var temp = Uint8ArrayToString(Base58.decode(this.secretStr)).split(':')
        if (!Array.isArray(temp) || temp.length !== 3) {
          this.$message.error('Error: Wrong token format')
          return
        }
        this.secretStr = ''
        const jsonStr = await this.$store.dispatch('cache/getLocalStorageCipher', 'secrets')
        const obj = JSON.parse(jsonStr)
        if (obj?.length > 0 && obj.some((item, index) => {
          if (item[2] === temp[2]) {
            // 找到已经导入的service的位置
            this.importedServiceIndex = obj.length - index - 1
            return true
          } else {
            return false
          }
        })) {
          // 定位到搜索结果
          window.scrollBy({
            top: 60 * this.importedServiceIndex,
            behavior: 'smooth'
          })
          return this.$message.warning(this.$t('containerPage.prompt.serviceAlreadyImported'))
        }
      } catch (error) {
        console.log('skip local cache checking')
        // 出错了就别被存进缓存和获取service信息
        this.$message.error('Error: ' + error)
        return
      }
      this.secret = temp
      const res = await this.getOrderInfo(this.secret, null, true)
      if (res === 'invalid') {
        return
      }
      if (res) {
        const newarr = [temp[2]]
        uploadSecrets(this.apiHost, { secrets: newarr })
      }
      this.saveSecrets()
      this.filterByStatus()
    },
    async getOrderInfo(secret, index = null, add = false, compareServiceID = null) {
      // 传入index的时候对指定位置的pod进行更新，否则就全部更新
      if (!validEmpty(secret)) return
      this.uploading = true
      let statusRight = true
      try {
        const res = await this.$store.dispatch(this.getOrderFunc, secret)
        if (res && res.code === 200) {
          if (res.data.service !== 'Container Service') {
            this.$message.warning('This page only supports importing Container Service.')
            this.uploading = false
            return 'invalid'
          }
          // 判断access token导入的service是否重复
          if (compareServiceID && compareServiceID !== res.data.id) {
            this.uploading = false
            this.$message.error(this.$t('containerPage.prompt.tokenNotMatchService'))
            return false
          }
          const alreadyExistIndex = this.pods.findIndex((item, index) => {
            if (item.id === res.data.id) {
              return true
            }
            return false
          })
          if (alreadyExistIndex >= 0) {
            index = alreadyExistIndex
            /*
            如果service已存在则根据index对已有的service进行替换（token），如果遇到需要替换token的service（import输入的token不同但都指向一个service），两种情况：
               1，当从my service页面多选批量导入时，会直接替换services的token不多做提示
               2，当从container页面输入token来导入时，替换service的token后会提示用户re-import和token已更新，如下
            */

            if (add) {
              this.importedServiceIndex = this.pods.length - alreadyExistIndex - 1
              window.scrollBy({
                top: 60 * this.importedServiceIndex,
                behavior: 'smooth'
              })
              this.$message({
                message: this.$t('containerPage.prompt.serviceReimported'),
                type: 'success',
                duration: 6000
              })
            }
          }
          // 导入都会进行替换
          const data = res.data
          data['secret'] = secret
          data['region'] = data.serviceOptions.region || '-'
          data['showOptions'] = false
          this.setPodsListByIndex(data, index, secret)

          statusRight = this.allowStatus.includes(res.data.status)
        }
      } catch (err) {
        statusRight = false
        if (add) {
          this.$message.error(errorMessage || 'error')
          this.uploading = false
        }
        // check error type
        // if secret longer than usual, it will throw DOMException
        // if (err instanceof DOMException) {
        //   this.$message({ message: err, type: 'warning' })
        // } else
        const errorData = err.response?.data
        const errorCode = errorData.error?.code
        const errorMessage = errorData.error?.message
        if (
          err.response &&
          this.addTokenError[errorCode] &&
          err.response.data
        ) {
          // access token无效的特殊情况
          // 433被删除
          // 422被禁用
          // 411过期了

          const serviceInfo = {
            id: errorData.userServiceID || '',
            token: errorData.tokenID,
            message: errorMessage,
            code: errorCode,
            status: this.addTokenError[errorCode],
            secret: secret
          }
          this.setPodsListByIndex(serviceInfo, index, secret, false)
        } else {
          // 其他报错的情况正常提示错误

          if (err.response && err.response.data && err.response.data.error) {
            this.$message.error(err.response.data.error.message)
          } else {
            this.$message.error(err)
          }
        }
      }
      // 删掉的、过期的access token会因为错误没加进this.secrets中而被清除
      // await this.saveSecrets()
      this.uploading = false
      this.secret = ''
      return statusRight
    },
    setPodsListByIndex(data, index, secret, needPodInfo = true) {
      data.uuid = uuidv4()
      if (!data.id) {
        data.id = 'Unknown-' + data.uuid
      }
      if (index !== null) {
        this.$set(this.pods, index, data)
        // 更新secret
        this.$set(this.secrets, index, secret)
        if (needPodInfo) {
          this.getPodInfo(secret, index)
        }
      } else {
        this.$set(this.pods, this.pods.length, data)
        this.$set(this.statusInfo, data.id, {})
        this.$set(this.secrets, this.secrets.length, secret)
        // await this.saveSecrets()
        if (needPodInfo) {
          this.getPodInfo(secret, this.pods.length - 1)
        }
      }
      this.displayPods = [...this.pods].reverse()
    },
    getStatus(status) {
      let result = status || 'Pending'
      if (status) {
        Object.keys(this.phaseText).forEach(key => {
          if (this.phaseText[key].includes(status)) {
            result = key
          }
        })
        return result
      }
    },
    async getPodInfo(secret, index) {
      if (!validEmpty(secret)) return
      const order = this.pods[index]

      if (order.status !== 'ServicePending' && order.status !== 'ServiceDone' && order.status !== 'ServiceAbort') {
        this.$store
          .dispatch('pod/info', secret)
          .then(res => {
            if (res && res.code === 200) {
              if (Object.keys(res.data).length === 0) { order['phase'] = 'Stop' }
              this.$set(this.statusInfo, order.id, res.data)
            }
          })
          .catch(e => {
            this.$set(this.statusInfo, order.id, {})
          })
      }
    },
    // check if there is any service with invalid token
    checkInvalidTokenService() {
      this.pods.forEach(
        item => {
          if (this.showTokenErrorExpand.includes(item.status)) {
            this.invalidTokenPrompt = true
            this.invalidTokenService.push(item)
          }
        }
      )
      if (this.invalidTokenPrompt) {
        this.invalidTokenNotification()
      }
    },
    async refreshAll() {
      this.pods = []
      this.statusInfo = []
      this.secrets = []
      this.invalidTokenService = []
      this.invalidTokenPrompt = false
      this.importedServiceIndex = -1
      const jsonStr = await this.$store.dispatch(
        'cache/getLocalStorageCipher',
        'secrets'
      )
      if (!jsonStr) return
      const obj = JSON.parse(jsonStr)
      if (obj?.length > 0) {
        for (const secret of obj) {
          await this.getOrderInfo(secret)
        }
      }
      this.saveSecrets()
      this.checkInvalidTokenService()
      this.displayPods = [...this.pods].reverse()
    },
    async deleteUserServiceContact(secret, id) {
      await this.$confirm(this.$t('containerPage.confirm.deleteEmail'), 'Warning', {
        confirmButtonText: this.$t('button.okButton'),
        cancelButtonText: this.$t('button.cancelButton'),
        type: 'warning'
      })
      try {
        await deleteUserServiceContact(secret)
        const target = this.pods.find(item => item.id === id)
        if (target) {
          this.$set(target, 'email', '')
        }
        this.$message.success(this.$t('containerPage.prompt.emailDeleted'))
        setTimeout(() => this.refreshPodAfterOperation(secret), 1500)
      } catch (error) {
        console.log(error)
      }
    },
    deployPod(orderid, secret, serviceOption, redeploy) {
      this.selectedServiceOption = serviceOption
      this.clickedPod = orderid
      this.selectedSecret = secret
      this.openDeployDialog = true
      this.isReDeploy = redeploy
    },
    deployDialogListener(val) {
      if (val.isSuccess && val.secret) {
        const podIndex = this.secrets.findIndex(i => i === val.secret)
        const pod = this.pods[podIndex]
        pod.status = 'ServiceRunning'
        this.$set(this.pods, podIndex, pod)
      }
    },
    statusInfoDialogListener(val) {
      if (!val.dialogVisible) {
        this.openStatusInfoDialog = false
      }
    }
  }
}
</script>
<style lang="scss">
.el-textarea__inner >>> .el-textarea__inner {
  height: 200px;
}
.import-secret-tip{
  word-break: normal;
  font-size: 15px;
  margin-bottom: 10px;
  margin-top: 5px;
}
.import-header-title{
  font-size: 12px;
  font-weight: bold;
  text-align: left;
  color: #606266;
  margin-bottom: 10px;

}
.expand-form-description {
  padding: 8px 12px;
  min-height: 32px;
  line-height: 1.4;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #606266;
  word-break: break-word;
  text-align: left;
  background-color: #F5F7FA;
  // border-color: #DCDFE6;
}
.time-left-ellipsis{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.word-length-count{
  font-size: 12px;
  color: #1890ff;

}
.container-service-default-icon{
  font-size: 2.8em;
  color: #909399;
  cursor: pointer;
}
.container-service-default-icon:hover{
  color: #1890ff;
}
.wrap-form-item .el-form-item__label {
  display: block;
}
.demo-table-expand label {
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
  width: 50%;
}
.el-table .imported-row {
  background:  #eff6ff;
}
.container-header-area{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.edit-label-input{
  display: flex;
  align-items: center;
  margin-top: 6px;
}
.secret-clear-button{
  color: #606266;
  font-weight: 600;
}
.renew-alert-btn{
  font-size: 11px;
  font-weight: bold;
  color: orange;
  cursor: pointer;
}
.service-refresh-button{
  margin-left: 10px;
  border: 1px solid #1890ff;
  padding: 9px 15px;
}
.box {
  line-height: 24px;
  position: absolute;
  padding: 4px 10px;
  width: 367px;
  color: #606266;
  background-color: #f5f6f7;
  left: -120px;
  border-radius: 5px;
}
.token-error-expand-title{
  line-height: 1.6;
  font-size: 16px;
  font-weight: bold;
}
.token-error-expand-text{
  line-height: 1.4;
  font-size: 13px;
}
.token-error-expand-id{
  background: #f5f8fd;
  margin-top: 10px;
  padding: 10px 10px;
}
.token-panel-btn-area{
  display: flex;
  justify-content: space-between;
}
.token-replace-btn{
  color: #1890ff;
  font-weight: 600;
  cursor: pointer;
}
.token-replace-btn:hover{
  color: #6db4f7;
  font-weight: 600;
}
.justified-text {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  text-align: left;
  word-break: keep-all;
}
.service-remain-time{
  color: #409EFF;
  margin-left: 10px;
  font-weight: 600;
}
.option-item{
  font-weight: bold;
}
.expandService {
  position: relative;
  height: 186px;
}
</style>
